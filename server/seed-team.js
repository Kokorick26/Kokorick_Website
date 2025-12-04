import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || 'eu-west-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const sampleMembers = [
    {
        id: uuidv4(),
        name: "Akshat Sharma",
        role: "Founder & Lead Engineer",
        quote: "We design AI systems that are measurable, auditable, and built to last.",
        bio: "10+ years building ML systems at scale. Previously led AI engineering at enterprise startups. PhD dropout who chose production over papers.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
        twitter: "",
        order: 0,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: "Sarah Chen",
        role: "Head of Research",
        quote: "Bridging the gap between cutting-edge research and real-world deployment.",
        bio: "Former research scientist at major tech labs. Specializes in LLMs, multimodal systems, and efficient fine-tuning.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
        twitter: "",
        order: 1,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: "Marcus Rodriguez",
        role: "Principal Engineer",
        quote: "Every system we build is designed for reliability, not just performance.",
        bio: "Infrastructure specialist with deep expertise in distributed systems, MLOps, and production-grade AI pipelines.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
        twitter: "",
        order: 2,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: "Emily Zhang",
        role: "Head of Product",
        quote: "AI products should be intuitive, trustworthy, and measurably valuable.",
        bio: "Product leader with background in AI/ML products. Focuses on user-centric design and measurable business outcomes.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
        twitter: "",
        order: 3,
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

async function seedTeamMembers() {
    console.log('Seeding team members...\n');

    for (const member of sampleMembers) {
        try {
            await dynamoDB.put({
                TableName: 'TeamMembers',
                Item: member
            }).promise();
            console.log(`✓ Added: ${member.name} (${member.role})`);
        } catch (err) {
            console.error(`✗ Failed to add ${member.name}:`, err.message);
        }
    }

    console.log('\n✓ Seeding complete!');
}

// Wait a bit for table to be ready
setTimeout(() => {
    seedTeamMembers();
}, 3000);
