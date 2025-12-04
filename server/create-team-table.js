import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const dynamoDB = new AWS.DynamoDB({
    region: process.env.AWS_REGION || 'eu-west-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const params = {
    TableName: 'TeamMembers',
    KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
};

dynamoDB.createTable(params, (err, data) => {
    if (err) {
        console.error('Error creating table:', JSON.stringify(err, null, 2));
    } else {
        console.log('✓ TeamMembers table created successfully!');
        console.log('Table details:', JSON.stringify(data, null, 2));
    }
});
