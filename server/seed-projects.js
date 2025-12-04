import dynamoDB from './db.js';
import { v4 as uuidv4 } from 'uuid';

const projects = [
    {
        id: uuidv4(),
        title: "Enterprise RAG Platform",
        description: "A scalable Retrieval-Augmented Generation system processing 10M+ documents with sub-second query times.",
        imageUrl: "https://images.unsplash.com/photo-1558494949-efc025793ad0?auto=format&fit=crop&q=80&w=2000",
        tags: ["LangChain", "Pinecone", "GPT-4", "FastAPI", "React"],
        featured: true,
        fullDescription: "We engineered a comprehensive Knowledge Management solution for a Fortune 500 financial institution. The system leverages advanced Retrieval-Augmented Generation (RAG) to ingest, index, and retrieve information from over 10 million internal documents. \n\nBy implementing a hybrid search architecture combining semantic vector search with keyword-based BM25, we achieved high-precision retrieval that understands domain-specific terminology. The platform includes a citation mechanism that links every answer back to the source document, ensuring trust and auditability.",
        impact: "Reduced information retrieval time by 90%, saving approximately 20,000 employee hours annually.",
        challenges: [
            "Ingesting and indexing 10TB+ of unstructured data without downtime",
            "Achieving sub-second latency for complex multi-hop queries",
            "Ensuring strict data governance and role-based access control (RBAC)"
        ],
        results: [
            "94% Answer Accuracy vs Human Experts",
            "<500ms Average Query Latency",
            "Seamless integration with existing Enterprise Search"
        ]
    },
    {
        id: uuidv4(),
        title: "AI Customer Support Agent",
        description: "Autonomous support agent handling 80% of customer inquiries with human-level quality.",
        imageUrl: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=2000",
        tags: ["OpenAI", "React", "Node.js", "PostgreSQL", "Redis"],
        featured: true,
        fullDescription: "Designed and deployed an intelligent conversational agent to automate Tier-1 customer support workflows. Unlike standard chatbots, this agent utilizes a state machine architecture combined with LLMs to handle complex, multi-turn conversations while maintaining context and adhering to business rules.\n\nThe system features a 'Human-in-the-loop' handoff mechanism, detecting sentiment and frustration levels to seamlessly transfer complex cases to human agents with a full conversation summary.",
        impact: "Automated 80% of incoming support tickets, allowing human agents to focus on high-value interactions.",
        challenges: [
            "Maintaining context over long conversation windows",
            "Preventing hallucinations in critical support scenarios",
            "Integrating with legacy CRM systems for real-time ticket updates"
        ],
        results: [
            "4.8/5 Customer Satisfaction (CSAT) Score",
            "2s Average Response Time",
            "24/7 Availability with zero downtime"
        ]
    },
    {
        id: uuidv4(),
        title: "Multi-Agent Research System",
        description: "Coordinated agent system for automated research, analysis, and report generation.",
        imageUrl: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=2000",
        tags: ["AutoGPT", "LangGraph", "Python", "Redis", "Docker"],
        featured: true,
        fullDescription: "Built a sophisticated system of autonomous agents collaborating to perform complex market research tasks. The architecture employs a 'Manager-Worker' pattern where a lead agent decomposes high-level research goals into sub-tasks assigned to specialized worker agents (Searcher, Analyst, Writer).\n\nThe system can autonomously browse the web, verify sources, synthesize information from multiple conflicting reports, and generate comprehensive PDF briefings with executive summaries.",
        impact: "Accelerated the market research phase for new product launches by 5x.",
        challenges: [
            "Coordinating state and memory across multiple independent agents",
            "Handling conflicting information from different sources",
            "preventing infinite loops in agent reasoning steps"
        ],
        results: [
            "12 Specialized Agents collaborating in real-time",
            "50+ Data Sources monitored simultaneously",
            "Automated generation of 20+ page research reports"
        ]
    },
    {
        id: uuidv4(),
        title: "Predictive Analytics Engine",
        description: "Custom ML models for demand forecasting with 95% accuracy, optimizing inventory.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000",
        tags: ["PyTorch", "Scikit-learn", "MLflow", "AWS", "Kubernetes"],
        featured: true,
        fullDescription: "Developed advanced machine learning models for accurate demand forecasting and inventory optimization for a retail giant. We utilized a Temporal Fusion Transformer (TFT) architecture to capture both long-term trends and short-term seasonality.\n\nThe pipeline includes automated retraining triggers based on data drift detection, ensuring the model adapts to changing market conditions without manual intervention.",
        impact: "Saved $2M/year in inventory holding costs and reduced stockouts by 40%.",
        challenges: [
            "Cleaning and normalizing noisy historical sales data",
            "Modeling complex seasonality and holiday effects",
            "Scaling inference to support 1M+ daily predictions"
        ],
        results: [
            "95% Forecast Accuracy (MAPE)",
            "1M+ Daily Predictions served",
            "Real-time dashboard for supply chain visibility"
        ]
    }
];

const seedProjects = async () => {
    console.log('🌱 Seeding projects...');
    for (const project of projects) {
        try {
            await dynamoDB.put({
                TableName: 'Projects',
                Item: {
                    ...project,
                    createdAt: new Date().toISOString()
                }
            }).promise();
            console.log(`✅ Added project: ${project.title}`);
        } catch (err) {
            console.error(`❌ Failed to add project: ${err.message}`);
        }
    }
    console.log('✨ Seeding complete!');
};

seedProjects();
