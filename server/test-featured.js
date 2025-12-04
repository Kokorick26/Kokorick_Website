import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const testFeatured = async () => {
    console.log('\n📊 Testing Featured Projects Filter\n');

    try {
        // Get all projects
        const allData = await dynamoDB.scan({ TableName: 'Projects' }).promise();
        console.log(`✅ Total projects in database: ${allData.Items.length}`);

        // Get only featured projects
        const featuredData = await dynamoDB.scan({
            TableName: 'Projects',
            FilterExpression: 'featured = :featured',
            ExpressionAttributeValues: {
                ':featured': true
            }
        }).promise();

        console.log(`⭐ Featured projects: ${featuredData.Items.length}\n`);

        console.log('Featured Projects:');
        featuredData.Items.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.title} (featured: ${item.featured})`);
        });

        console.log('\nAll Projects:');
        allData.Items.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.title} (featured: ${item.featured || false})`);
        });

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
};

testFeatured();
