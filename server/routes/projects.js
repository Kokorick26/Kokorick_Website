import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dynamoDB from '../db.js';

const router = express.Router();
const TABLE_NAME = 'Projects';

// Get only featured projects - MUST BE BEFORE '/' route
router.get('/featured', async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'featured = :featured',
            ExpressionAttributeValues: {
                ':featured': true
            }
        };
        const data = await dynamoDB.scan(params).promise();
        // Sort by order (lower number = higher priority)
        const sorted = data.Items.sort((a, b) => (a.order || 999) - (b.order || 999));
        console.log(`[/api/projects/featured] Returning ${sorted.length} featured projects`);
        res.json(sorted);
    } catch (err) {
        console.error('[/api/projects/featured] Error:', err);
        res.status(500).json({ error: 'Could not load featured projects' });
    }
});

// Get all projects
router.get('/', async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME,
        };
        const data = await dynamoDB.scan(params).promise();
        // Sort by order (lower number = higher priority)
        const sorted = data.Items.sort((a, b) => (a.order || 999) - (b.order || 999));
        console.log(`[/api/projects] Returning ${sorted.length} total projects`);
        res.json(sorted);
    } catch (err) {
        console.error('[/api/projects] Error:', err);
        res.status(500).json({ error: 'Could not load projects' });
    }
});

// Add a project
router.post('/', async (req, res) => {
    const { title, description, fullDescription, impact, challenges, results, imageUrl, link, tags, featured, order } = req.body;
    const id = uuidv4();

    const newProject = {
        id,
        title,
        description,
        fullDescription: fullDescription || '',
        impact: impact || '',
        challenges: challenges || [],
        results: results || [],
        imageUrl,
        link,
        tags,
        featured: featured || false,
        order: order || 999,
        createdAt: new Date().toISOString(),
    };

    try {
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: newProject,
        }).promise();
        res.status(201).json(newProject);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not create project' });
    }
});

// Update project orders in bulk - MUST BE BEFORE /:id routes
router.put('/reorder/bulk', async (req, res) => {
    const { orders } = req.body; // Array of { id, order }
    
    try {
        // Update each project's order
        const updatePromises = orders.map(({ id, order }) => 
            dynamoDB.update({
                TableName: TABLE_NAME,
                Key: { id },
                UpdateExpression: 'SET #order = :order',
                ExpressionAttributeNames: { '#order': 'order' },
                ExpressionAttributeValues: { ':order': order }
            }).promise()
        );
        
        await Promise.all(updatePromises);
        res.json({ message: 'Project orders updated successfully' });
    } catch (err) {
        console.error('[/api/projects/reorder/bulk] Error:', err);
        res.status(500).json({ error: 'Could not update project orders' });
    }
});

// Update a project
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, fullDescription, impact, challenges, results, imageUrl, link, tags, featured, order } = req.body;

    const updatedProject = {
        id,
        title,
        description,
        fullDescription: fullDescription || '',
        impact: impact || '',
        challenges: challenges || [],
        results: results || [],
        imageUrl,
        link,
        tags,
        featured: featured || false,
        order: order !== undefined ? order : 999,
        updatedAt: new Date().toISOString(),
    };

    try {
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: updatedProject,
        }).promise();
        res.json(updatedProject);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not update project' });
    }
});

// Delete a project
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await dynamoDB.delete({
            TableName: TABLE_NAME,
            Key: { id },
        }).promise();
        res.json({ message: 'Project deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not delete project' });
    }
});

export default router;
