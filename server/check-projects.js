import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const checkProjects = async () => {
    try {
        const data = await dynamoDB.scan({ TableName: 'Projects' }).promise();
        console.log('Projects count:', data.Items.length);
        if (data.Items.length > 0) {
            console.log('First item:', data.Items[0]);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
};

checkProjects();
