import dynamoDB from './db.js';
import { v4 as uuidv4 } from 'uuid';

const testimonials = [
    {
        id: uuidv4(),
        name: "Shekinah Tshiokufila",
        role: "Software Engineer",
        company: "Tailus",
        content: "Tailus has transformed the way I develop web applications. Their extensive collection of UI components, blocks, and templates has significantly accelerated my workflow. The flexibility to customize every aspect allows me to create unique user experiences. Tailus is a game-changer for modern web development",
        avatarUrl: "https://tailus.io/images/reviews/shekinah.webp",
        companyLogoUrl: "https://html.tailus.io/blocks/customers/nike.svg"
    },
    {
        id: uuidv4(),
        name: "Jonathan Yombo",
        role: "Software Engineer",
        company: "Google",
        content: "Tailus is really extraordinary and very practical, no need to break your head. A real gold mine.",
        avatarUrl: "https://tailus.io/images/reviews/jonathan.webp"
    },
    {
        id: uuidv4(),
        name: "Yucel Faruksahan",
        role: "Creator",
        company: "Tailkits",
        content: "Great work on tailfolio template. This is one of the best personal website that I have seen so far!",
        avatarUrl: "https://tailus.io/images/reviews/yucel.webp"
    },
    {
        id: uuidv4(),
        name: "Rodrigo Aguilar",
        role: "Creator",
        company: "TailwindAwesome",
        content: "Great work on tailfolio template. This is one of the best personal website that I have seen so far!",
        avatarUrl: "https://tailus.io/images/reviews/rodrigo.webp"
    }
];

const seedTestimonials = async () => {
    console.log('🌱 Seeding testimonials...');

    for (const testimonial of testimonials) {
        try {
            await dynamoDB.put({
                TableName: 'Testimonials',
                Item: testimonial
            }).promise();
            console.log(`✅ Added testimonial from ${testimonial.name}`);
        } catch (err) {
            console.error(`❌ Failed to add testimonial: ${err.message}`);
        }
    }

    console.log('✨ Seeding complete!');
};

seedTestimonials();
