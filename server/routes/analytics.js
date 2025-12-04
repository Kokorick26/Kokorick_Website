import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dynamoDB from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const TABLE_NAME = 'KokorickAnalytics';

/**
 * Lookup geolocation data from IP address using ip-api.com (free, no key required)
 * Returns null if lookup fails
 */
async function getGeoLocation(ip) {
    // Skip localhost/private IPs
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        return null;
    }

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,lat,lon`);
        if (!response.ok) return null;

        const data = await response.json();
        if (data.status !== 'success') return null;

        return {
            country: data.country || null,
            countryCode: data.countryCode || null,
            region: data.regionName || null,
            city: data.city || null,
            latitude: data.lat || null,
            longitude: data.lon || null,
        };
    } catch (err) {
        console.error('Geolocation lookup failed:', err.message);
        return null;
    }
}

/**
 * Extract client IP from request
 */
function getClientIp(req) {
    // Check X-Forwarded-For header first (set by Nginx proxy)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // X-Forwarded-For can contain multiple IPs, take the first one (client IP)
        const ip = forwarded.split(',')[0].trim();
        // Remove IPv6 prefix if present
        return ip.replace(/^::ffff:/, '');
    }

    // Fallback to direct connection IP
    const ip = req.ip || req.connection?.remoteAddress || '';
    return ip.replace(/^::ffff:/, '');
}

/**
 * POST /api/analytics/visit
 * Public endpoint - records a page visit
 */
router.post('/visit', async (req, res) => {
    try {
        const { path, userAgent, referrer, screenWidth } = req.body;

        // Validate required fields
        if (!path || !userAgent) {
            return res.status(400).json({ error: 'Bad Request', message: 'Missing required field: path or userAgent' });
        }

        const ip = getClientIp(req);
        const timestamp = Date.now();
        const id = uuidv4();

        console.log(`[Analytics] Headers:`, {
            'x-forwarded-for': req.headers['x-forwarded-for'],
            'x-real-ip': req.headers['x-real-ip'],
            'req.ip': req.ip,
            'remoteAddress': req.connection?.remoteAddress
        });
        console.log(`[Analytics] Extracted IP: ${ip}, Path: ${path}`);

        // Attempt geolocation (non-blocking for response)
        let geoData = null;
        try {
            geoData = await getGeoLocation(ip);
            if (geoData) {
                console.log(`[Analytics] Geolocation success: ${geoData.country}, ${geoData.city}`);
            } else {
                console.log(`[Analytics] Geolocation skipped or failed for IP: ${ip}`);
            }
        } catch (e) {
            console.log(`[Analytics] Geolocation error: ${e.message}`);
            // Silent failure - continue without geo data
        }

        const visitRecord = {
            id,
            timestamp,
            path: String(path).substring(0, 500), // Limit length
            userAgent: String(userAgent).substring(0, 1000), // Limit length
            referrer: referrer ? String(referrer).substring(0, 500) : null,
            screenWidth: typeof screenWidth === 'number' ? screenWidth : null,
            ip: ip || null,
            country: geoData?.country || null,
            countryCode: geoData?.countryCode || null,
            city: geoData?.city || null,
            region: geoData?.region || null,
            latitude: geoData?.latitude || null,
            longitude: geoData?.longitude || null,
        };

        // Store in DynamoDB
        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: visitRecord,
        }).promise();

        res.status(200).json({ message: 'Visit recorded' });
    } catch (err) {
        console.error('Error recording visit:', err);
        // Return 200 even on failure (silent failure per spec)
        res.status(200).json({ message: 'Visit recorded' });
    }
});

/**
 * GET /api/analytics/visits
 * Protected endpoint - retrieves all visit records
 */
router.get('/visits', auth, async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME,
        };

        const data = await dynamoDB.scan(params).promise();

        // Sort by timestamp descending
        const sortedItems = (data.Items || []).sort((a, b) => b.timestamp - a.timestamp);

        res.json(sortedItems);
    } catch (err) {
        console.error('Error fetching visits:', err);
        res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch analytics data' });
    }
});

/**
 * GET /api/analytics/stats
 * Protected endpoint - retrieves aggregated stats
 */
router.get('/stats', auth, async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME,
        };

        const data = await dynamoDB.scan(params).promise();
        const visits = data.Items || [];

        // Calculate stats
        const totalVisits = visits.length;

        // Unique visitors by IP
        const uniqueIps = new Set(visits.map(v => v.ip).filter(Boolean));
        const uniqueVisitors = uniqueIps.size;

        // Average pages per visitor
        const avgPagesPerVisitor = uniqueVisitors > 0 ? (totalVisits / uniqueVisitors).toFixed(2) : 0;

        // Bounce rate: visitors who viewed only 1 page
        const visitsByIp = {};
        visits.forEach(v => {
            if (v.ip) {
                visitsByIp[v.ip] = (visitsByIp[v.ip] || 0) + 1;
            }
        });
        const singlePageVisitors = Object.values(visitsByIp).filter(count => count === 1).length;
        const bounceRate = uniqueVisitors > 0 ? ((singlePageVisitors / uniqueVisitors) * 100).toFixed(1) : 0;

        res.json({
            totalVisits,
            uniqueVisitors,
            avgPagesPerVisitor: parseFloat(avgPagesPerVisitor),
            bounceRate: parseFloat(bounceRate),
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch analytics stats' });
    }
});

export default router;
