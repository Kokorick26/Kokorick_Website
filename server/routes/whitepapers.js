import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import dynamoDB from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const TABLE_NAME = 'Whitepapers';
const BUCKET_NAME = 'kokorick-assets';

// Configure S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-west-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for PDFs
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});

// Get all whitepapers (public)
router.get('/', async (req, res) => {
    try {
        const data = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const whitepapers = (data.Items || [])
            .filter(w => w.published)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(whitepapers);
    } catch (err) {
        console.error('Error fetching whitepapers:', err);
        res.status(500).json({ error: 'Could not load whitepapers' });
    }
});

// Get all whitepapers for admin (includes unpublished)
router.get('/admin', auth, async (req, res) => {
    try {
        const data = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const whitepapers = (data.Items || [])
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(whitepapers);
    } catch (err) {
        console.error('Error fetching whitepapers:', err);
        res.status(500).json({ error: 'Could not load whitepapers' });
    }
});

// Get single whitepaper by ID
router.get('/:id', async (req, res) => {
    try {
        const data = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { id: req.params.id }
        }).promise();
        
        if (!data.Item) {
            return res.status(404).json({ error: 'Whitepaper not found' });
        }
        res.json(data.Item);
    } catch (err) {
        console.error('Error fetching whitepaper:', err);
        res.status(500).json({ error: 'Could not load whitepaper' });
    }
});

// Create whitepaper with PDF upload
router.post('/', auth, upload.single('pdf'), async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const published = req.body.published === 'true';
        
        if (!title || !req.file) {
            return res.status(400).json({ error: 'Title and PDF file are required' });
        }

        const id = uuidv4();
        const pdfKey = `whitepapers/${id}.pdf`;

        // Upload PDF to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: pdfKey,
            Body: req.file.buffer,
            ContentType: 'application/pdf',
        }));

        const pdfUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-2'}.amazonaws.com/${pdfKey}`;

        const whitepaper = {
            id,
            title,
            description: description || '',
            category: category || 'general',
            pdfUrl,
            pdfKey,
            published,
            downloadCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await dynamoDB.put({ TableName: TABLE_NAME, Item: whitepaper }).promise();
        res.status(201).json(whitepaper);
    } catch (err) {
        console.error('Error creating whitepaper:', err);
        res.status(500).json({ error: 'Could not create whitepaper' });
    }
});

// Update whitepaper
router.put('/:id', auth, upload.single('pdf'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category } = req.body;
        const published = req.body.published === 'true';

        // Get existing whitepaper
        const existing = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { id }
        }).promise();

        if (!existing.Item) {
            return res.status(404).json({ error: 'Whitepaper not found' });
        }

        let pdfUrl = existing.Item.pdfUrl;
        let pdfKey = existing.Item.pdfKey;

        // If new PDF uploaded, replace the old one
        if (req.file) {
            // Delete old PDF
            if (existing.Item.pdfKey) {
                try {
                    await s3Client.send(new DeleteObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: existing.Item.pdfKey,
                    }));
                } catch (e) {
                    console.error('Error deleting old PDF:', e);
                }
            }

            // Upload new PDF
            pdfKey = `whitepapers/${id}.pdf`;
            await s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: pdfKey,
                Body: req.file.buffer,
                ContentType: 'application/pdf',
            }));
            pdfUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-2'}.amazonaws.com/${pdfKey}`;
        }

        const updatedWhitepaper = {
            ...existing.Item,
            title: title || existing.Item.title,
            description: description !== undefined ? description : existing.Item.description,
            category: category || existing.Item.category,
            pdfUrl,
            pdfKey,
            published,
            updatedAt: new Date().toISOString(),
        };

        await dynamoDB.put({ TableName: TABLE_NAME, Item: updatedWhitepaper }).promise();
        res.json(updatedWhitepaper);
    } catch (err) {
        console.error('Error updating whitepaper:', err);
        res.status(500).json({ error: 'Could not update whitepaper' });
    }
});

// Delete whitepaper
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Get whitepaper to find PDF key
        const existing = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { id }
        }).promise();

        if (existing.Item?.pdfKey) {
            try {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: existing.Item.pdfKey,
                }));
            } catch (e) {
                console.error('Error deleting PDF:', e);
            }
        }

        await dynamoDB.delete({ TableName: TABLE_NAME, Key: { id } }).promise();
        res.json({ message: 'Whitepaper deleted' });
    } catch (err) {
        console.error('Error deleting whitepaper:', err);
        res.status(500).json({ error: 'Could not delete whitepaper' });
    }
});

// Track download
router.post('/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        
        const existing = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { id }
        }).promise();

        if (!existing.Item) {
            return res.status(404).json({ error: 'Whitepaper not found' });
        }

        const updated = {
            ...existing.Item,
            downloadCount: (existing.Item.downloadCount || 0) + 1,
        };

        await dynamoDB.put({ TableName: TABLE_NAME, Item: updated }).promise();
        res.json({ pdfUrl: existing.Item.pdfUrl });
    } catch (err) {
        console.error('Error tracking download:', err);
        res.status(500).json({ error: 'Could not process download' });
    }
});

export default router;
