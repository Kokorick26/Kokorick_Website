import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dynamoDB from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const TABLE_NAME = 'TeamMembers';

// Get all team members (public)
router.get('/', async (req, res) => {
    try {
        const data = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const members = (data.Items || [])
            .filter(m => m.published === true || m.published === 'true')
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        console.log(`[/api/team] Returning ${members.length} published team members`);
        res.json(members);
    } catch (err) {
        console.error('Error fetching team members:', err);
        res.status(500).json({ error: 'Could not load team members' });
    }
});

// Get all team members for admin (includes unpublished)
router.get('/admin', auth, async (req, res) => {
    try {
        const data = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const members = (data.Items || [])
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        res.json(members);
    } catch (err) {
        console.error('Error fetching team members:', err);
        res.status(500).json({ error: 'Could not load team members' });
    }
});

// Get single team member by ID
router.get('/:id', async (req, res) => {
    try {
        const data = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { id: req.params.id }
        }).promise();

        if (!data.Item) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        res.json(data.Item);
    } catch (err) {
        console.error('Error fetching team member:', err);
        res.status(500).json({ error: 'Could not load team member' });
    }
});

// Create team member
router.post('/', auth, async (req, res) => {
    try {
        const { name, role, quote, bio, image, linkedin, github, twitter, order, published } = req.body;

        if (!name || !role) {
            return res.status(400).json({ error: 'Name and role are required' });
        }

        const id = uuidv4();
        const member = {
            id,
            name,
            role,
            quote: quote || '',
            bio: bio || '',
            image: image || '',
            linkedin: linkedin || '',
            github: github || '',
            twitter: twitter || '',
            order: order || 0,
            published: published !== undefined ? published : true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await dynamoDB.put({ TableName: TABLE_NAME, Item: member }).promise();
        res.status(201).json(member);
    } catch (err) {
        console.error('Error creating team member:', err);
        res.status(500).json({ error: 'Could not create team member' });
    }
});

// Update team member
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, quote, bio, image, linkedin, github, twitter, order, published } = req.body;

        // Get existing member
        const existing = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { id }
        }).promise();

        if (!existing.Item) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        const updatedMember = {
            ...existing.Item,
            name: name || existing.Item.name,
            role: role || existing.Item.role,
            quote: quote !== undefined ? quote : existing.Item.quote,
            bio: bio !== undefined ? bio : existing.Item.bio,
            image: image !== undefined ? image : existing.Item.image,
            linkedin: linkedin !== undefined ? linkedin : existing.Item.linkedin,
            github: github !== undefined ? github : existing.Item.github,
            twitter: twitter !== undefined ? twitter : existing.Item.twitter,
            order: order !== undefined ? order : existing.Item.order,
            published: published !== undefined ? published : existing.Item.published,
            updatedAt: new Date().toISOString(),
        };

        await dynamoDB.put({ TableName: TABLE_NAME, Item: updatedMember }).promise();
        res.json(updatedMember);
    } catch (err) {
        console.error('Error updating team member:', err);
        res.status(500).json({ error: 'Could not update team member' });
    }
});

// Delete team member
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        await dynamoDB.delete({ TableName: TABLE_NAME, Key: { id } }).promise();
        res.json({ message: 'Team member deleted' });
    } catch (err) {
        console.error('Error deleting team member:', err);
        res.status(500).json({ error: 'Could not delete team member' });
    }
});

export default router;
