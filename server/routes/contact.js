const express = require('express');
const router = express.Router();
const dynamoDB = require('../db');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

const TABLE_NAME = 'ContactRequests';

// Submit Contact Form
router.post('/', async (req, res) => {
    const { name, email, phone, company, service, budget, message, status, timestamp } = req.body;

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
        budget: budget || '',
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
        const params = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: 'set #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':status': status,
            },
            ReturnValues: 'ALL_NEW',
        };

        const updated = await dynamoDB.update(params).promise();
        res.json(updated.Attributes);
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

module.exports = router;
