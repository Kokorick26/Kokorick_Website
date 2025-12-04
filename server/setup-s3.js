import { S3Client, CreateBucketCommand, PutBucketCorsCommand, PutPublicAccessBlockCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const BUCKET_NAME = 'kokorick-assets';
const REGION = process.env.AWS_REGION || 'eu-west-2';

const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function setupS3Bucket() {
    console.log(`Setting up S3 bucket: ${BUCKET_NAME} in region ${REGION}`);

    try {
        // 1. Create the bucket
        console.log('Creating bucket...');
        try {
            await s3Client.send(new CreateBucketCommand({
                Bucket: BUCKET_NAME,
                CreateBucketConfiguration: {
                    LocationConstraint: REGION,
                },
            }));
            console.log('✓ Bucket created successfully');
        } catch (error) {
            if (error.name === 'BucketAlreadyOwnedByYou' || error.name === 'BucketAlreadyExists') {
                console.log('✓ Bucket already exists');
            } else {
                throw error;
            }
        }

        // 2. Configure public access block (allow public access for images)
        console.log('Configuring public access...');
        await s3Client.send(new PutPublicAccessBlockCommand({
            Bucket: BUCKET_NAME,
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: false,
                IgnorePublicAcls: false,
                BlockPublicPolicy: false,
                RestrictPublicBuckets: false,
            },
        }));
        console.log('✓ Public access configured');

        // 3. Set bucket policy for public read access
        console.log('Setting bucket policy...');
        const bucketPolicy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'PublicReadGetObject',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: 's3:GetObject',
                    Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
                },
            ],
        };

        await s3Client.send(new PutBucketPolicyCommand({
            Bucket: BUCKET_NAME,
            Policy: JSON.stringify(bucketPolicy),
        }));
        console.log('✓ Bucket policy set');

        // 4. Configure CORS
        console.log('Configuring CORS...');
        await s3Client.send(new PutBucketCorsCommand({
            Bucket: BUCKET_NAME,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ['*'],
                        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                        AllowedOrigins: ['*'],
                        ExposeHeaders: ['ETag'],
                        MaxAgeSeconds: 3000,
                    },
                ],
            },
        }));
        console.log('✓ CORS configured');

        console.log('\n========================================');
        console.log('S3 bucket setup complete!');
        console.log(`Bucket URL: https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/`);
        console.log('========================================\n');

    } catch (error) {
        console.error('Error setting up S3 bucket:', error);
        process.exit(1);
    }
}

setupS3Bucket();
