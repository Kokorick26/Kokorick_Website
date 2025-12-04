import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dynamoDB from '../db.js';

const router = express.Router();
const TABLE_NAME = 'Testimonials';

// Get all testimonials
router.get('/', async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME,
        };
        const data = await dynamoDB.scan(params).promise();
        res.json(data.Items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not load testimonials' });
    }
});

// Add a testimonial
router.post('/', async (req, res) => {
    const { name, role, company, content, avatarUrl, companyLogoUrl } = req.body;
    const id = uuidv4();

    const newTestimonial = {
        id,
        name,
        role,
        company,
        content,
        avatarUrl,
        companyLogoUrl,
        createdAt: new Date().toISOString(),
    };

    try {
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: newTestimonial,
        }).promise();
        res.status(201).json(newTestimonial);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not create testimonial' });
    }
});

// Update a testimonial
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, role, company, content, avatarUrl, companyLogoUrl } = req.body;

    const updatedTestimonial = {
        id,
        name,
        role,
        company,
        content,
        avatarUrl,
        companyLogoUrl,
        updatedAt: new Date().toISOString(),
    };

    try {
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: updatedTestimonial,
        }).promise();
        res.json(updatedTestimonial);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not update testimonial' });
    }
});

// Delete a testimonial
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await dynamoDB.delete({
            TableName: TABLE_NAME,
            Key: { id },
        }).promise();
        res.json({ message: 'Testimonial deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not delete testimonial' });
    }
});

export default router;
