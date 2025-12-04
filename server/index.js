import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authEnhanced.js';
import contactRoutes from './routes/contact.js';
import testimonialsRoutes from './routes/testimonials.js';
import projectsRoutes from './routes/projects.js';
import uploadRoutes from './routes/upload.js';
import blogsRoutes from './routes/blogs.js';
import whitepapersRoutes from './routes/whitepapers.js';
import newsletterRoutes from './routes/newsletter.js';
import teamRoutes from './routes/team.js';
import analyticsRoutes from './routes/analytics.js';
import usersRoutes from './routes/users.js';
import rolesRoutes from './routes/roles.js';
import profileRoutes from './routes/profile.js';
import auditLogsRoutes from './routes/auditLogs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - required for Express to correctly parse X-Forwarded-* headers from Nginx
app.set('trust proxy', true);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', testimonialsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/whitepapers', whitepapersRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/audit-logs', auditLogsRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${PORT} (localhost only - proxied through Nginx)`);
});
