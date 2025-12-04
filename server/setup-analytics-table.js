import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();

const TABLE_NAME = 'KokorickAnalytics';

async function createAnalyticsTable() {
    const params = {
        TableName: TABLE_NAME,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' } // Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST' // On-demand capacity
    };

    try {
        // Check if table exists
        const tables = await dynamodb.listTables({}).promise();
        if (tables.TableNames.includes(TABLE_NAME)) {
            console.log(`Table "${TABLE_NAME}" already exists.`);
            return;
        }

        // Create table
        await dynamodb.createTable(params).promise();
        console.log(`Table "${TABLE_NAME}" created successfully.`);

        // Wait for table to be active
        console.log('Waiting for table to become active...');
        await dynamodb.waitFor('tableExists', { TableName: TABLE_NAME }).promise();
        console.log('Table is now active and ready to use.');
    } catch (err) {
        if (err.code === 'ResourceInUseException') {
            console.log(`Table "${TABLE_NAME}" already exists.`);
        } else {
            console.error('Error creating table:', err);
            throw err;
        }
    }
}

createAnalyticsTable()
    .then(() => {
        console.log('Analytics table setup complete.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Failed to setup analytics table:', err);
        process.exit(1);
    });
