import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const awsConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

AWS.config.update(awsConfig);

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const checkData = async () => {
    try {
        const data = await dynamoDB.scan({ TableName: 'Testimonials' }).promise();
        console.log('Testimonials count:', data.Items.length);
        console.log('First item:', data.Items[0]);
    } catch (err) {
        console.error('Error:', err.message);
    }
};

checkData();
