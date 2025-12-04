import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dynamoDB from '../db.js';

const router = express.Router();
const TABLE_NAME = 'AdminUsers';

// Register Admin (One-time setup or protected)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user exists
        const params = {
            TableName: TABLE_NAME,
            Key: { username },
        };

        const existingUser = await dynamoDB.get(params).promise();
        if (existingUser.Item) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user
        const newUser = {
            username,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
        };

        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: newUser,
        }).promise();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Admin
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check for user
        const params = {
            TableName: TABLE_NAME,
            Key: { username },
        };

        const user = await dynamoDB.get(params).promise();
        if (!user.Item) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.Item.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.Item.username },
            process.env.JWT_SECRET || 'your_jwt_secret_key_change_this',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                username: user.Item.username,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
