const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'AdminUsers';

const seedAdmin = async () => {
    const username = 'Akshat sharma';
    const password = 'KokorickSecurePass2025!'; // Strong password

    console.log(`🚀 Seeding admin user: "${username}"`);

    try {
        // 1. Check if user exists
        const getParams = {
            TableName: TABLE_NAME,
            Key: { username },
        };
        const existing = await dynamoDB.get(getParams).promise();

        if (existing.Item) {
            console.log('⚠️  User already exists. Updating password...');
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save user
        const putParams = {
            TableName: TABLE_NAME,
            Item: {
                username,
                password: hashedPassword,
                createdAt: new Date().toISOString(),
                role: 'superadmin'
            },
        };

        await dynamoDB.put(putParams).promise();
        console.log('✅ Admin account seeded successfully!');
        console.log('-----------------------------------');
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');

    } catch (err) {
        console.error('❌ Error seeding admin:', err);
    }
};

seedAdmin();
