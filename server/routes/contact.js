import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dynamoDB from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const TABLE_NAME = 'ContactRequests';

// Submit Contact Form
router.post('/', async (req, res) => {
    const { name, email, phone, company, service, message, status, timestamp } = req.body;

    if (!name || !email || !phone || !message) {
        return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const newRequest = {
        id: uuidv4(),
        name,
        email,
        phone,
        company: company || '',
        service,
        message,
        status: status || 'new',
        timestamp: timestamp || new Date().toISOString(),
    };

    try {
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: newRequest,
        }).promise();

        res.status(201).json(newRequest);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error saving contact request' });
    }
});

// Get All Requests (Protected)
router.get('/', auth, async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME,
        };

        const data = await dynamoDB.scan(params).promise();
        // Sort by timestamp descending
        const sortedItems = data.Items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(sortedItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
});

// Update Request Status (Protected)
router.patch('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Get existing request
        const getParams = {
            TableName: TABLE_NAME,
            Key: { id },
        };
        const existing = await dynamoDB.get(getParams).promise();

        if (!existing.Item) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Update status
        const updatedItem = {
            ...existing.Item,
            status: status,
            updatedAt: new Date().toISOString()
        };

        // Save back
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: updatedItem
        }).promise();

        res.json(updatedItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating request' });
    }
});

// Delete Request (Protected)
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        await dynamoDB.delete({
            TableName: TABLE_NAME,
            Key: { id },
        }).promise();

        res.json({ message: 'Request deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting request' });
    }
});

export default router;
