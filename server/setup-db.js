import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB();

const createTable = async (params) => {
    try {
        await dynamodb.createTable(params).promise();
        console.log(`✅ Table created successfully: ${params.TableName}`);
    } catch (err) {
        if (err.code === 'ResourceInUseException') {
            console.log(`ℹ️  Table already exists: ${params.TableName}`);
        } else {
            console.error(`❌ Error creating table ${params.TableName}:`, err.message);
        }
    }
};

const setup = async () => {
    console.log('🚀 Starting DynamoDB Setup...');

    // 1. AdminUsers Table
    await createTable({
        TableName: 'AdminUsers',
        KeySchema: [
            { AttributeName: 'username', KeyType: 'HASH' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'username', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
    });

    // 2. ContactRequests Table
    await createTable({
        TableName: 'ContactRequests',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
    });

    // 3. Testimonials Table
    await createTable({
        TableName: 'Testimonials',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
    });

    // 4. Projects Table
    await createTable({
        TableName: 'Projects',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
    });

    // 5. Whitepapers Table
    await createTable({
        TableName: 'Whitepapers',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
    });

    // 6. Newsletter Subscribers Table
    await createTable({
        TableName: 'NewsletterSubscribers',
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
    });

    console.log('✨ Setup complete!');
};

setup();
