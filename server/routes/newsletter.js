import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dynamoDB from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const TABLE_NAME = 'NewsletterSubscribers';

// Subscribe to newsletter (public)
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Check if already subscribed
        const existing = await dynamoDB.scan({
            TableName: TABLE_NAME,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email.toLowerCase() }
        }).promise();

        if (existing.Items && existing.Items.length > 0) {
            return res.status(200).json({ message: 'Already subscribed' });
        }

        const subscriber = {
            id: uuidv4(),
            email: email.toLowerCase(),
            subscribedAt: new Date().toISOString(),
        };

        await dynamoDB.put({ TableName: TABLE_NAME, Item: subscriber }).promise();
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (err) {
        console.error('Error subscribing:', err);
        res.status(500).json({ error: 'Could not subscribe' });
    }
});

// Get all subscribers (admin only)
router.get('/', auth, async (req, res) => {
    try {
        const data = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const subscribers = (data.Items || [])
            .sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));
        res.json(subscribers);
    } catch (err) {
        console.error('Error fetching subscribers:', err);
        res.status(500).json({ error: 'Could not load subscribers' });
    }
});

// Delete subscriber (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        await dynamoDB.delete({
            TableName: TABLE_NAME,
            Key: { id: req.params.id }
        }).promise();
        res.json({ message: 'Subscriber removed' });
    } catch (err) {
        console.error('Error deleting subscriber:', err);
        res.status(500).json({ error: 'Could not delete subscriber' });
    }
});

export default router;
