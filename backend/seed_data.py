"""
Seed data script to populate MongoDB with initial portfolio data
This mirrors the structure from frontend/src/mock.js
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Profile data
profile_data = {
    "id": "vinayak-bhadani-profile",
    "personal": {
        "name": "Vinayak Bhadani",
        "title": "Supply Chain Analyst | Demand Planning | Data-Driven Logistics",
        "location": "Dubai, UAE",
        "phone": "+971556270561",
        "email": "vinayakbhadani1998@gmail.com",
        "linkedin": "https://www.linkedin.com/in/vinayakbhadani",
        "heroImage": "https://images.unsplash.com/photo-1592085198739-ffcad7f36b54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxzdXBwbHklMjBjaGFpbnxlbnwwfHx8fDE3NTYxNzYzMDV8MA&ixlib=rb-4.1.0&q=85"
    },
    "hero": {
        "tagline": "The Supply Chain Strategist Who Optimized 100,000+ Units Monthly & Cut Logistics Costs by 30%",
        "description": "Transforming complex supply chain challenges into streamlined, profitable operations across MENA and GCC markets",
        "socialProof": {
            "experience": "2+",
            "unitsManaged": "100,000+",
            "costReduction": "30%",
            "accuracyRate": "98%"
        }
    },
    "about": {
        "story": {
            "challenge": "When I started my career, I witnessed how inefficient supply chain operations could cripple entire business operations, leading to stockouts, excess inventory, and frustrated customers.",
            "journey": "My journey began with a unique combination of Information Science engineering background and hands-on warehouse operations, giving me both the technical analytical skills and practical understanding of ground-level challenges.",
            "breakthrough": "The defining moment came when I led cross-functional S&OP operations across China-MENA-GCC, where I realized that true supply chain optimization requires both data-driven insights and strategic relationship management.",
            "impact": "Today, I've successfully managed inventory flows exceeding 100,000 units monthly, improved forecast accuracy by 30%, and negotiated logistics cost reductions that directly impact bottom-line profitability.",
            "future": "I'm focused on leveraging AI and machine learning to create predictive supply chain models that can anticipate market disruptions and optimize inventory positioning proactively."
        },
        "philosophy": "Supply chain excellence isn't just about moving products efficiently—it's about creating resilient systems that adapt to market volatility while maintaining operational excellence."
    },
    "contact": {
        "cta": "Ready to optimize your supply chain operations?",
        "description": "Let's discuss how data-driven supply chain strategies can transform your business operations and drive measurable results.",
        "availability": "Available for consulting projects and full-time opportunities"
    }
}

# Experience data
experience_data = [
    {
        "id": "ands-supply-chain-analyst",
        "company": "ANDS",
        "position": "Supply Chain Analyst",
        "location": "Dubai, United Arab Emirates",
        "duration": "October 2023 - Present",
        "type": "Current Role",
        "achievements": [
            "Led cross-functional S&OP operations across China–MENA–GCC, boosting forecast accuracy by 30%",
            "Managed inventory flow of 100,000+ units/month, eliminating aged stock by 18%",
            "Supervised 3PL logistics execution, driving 25% improvement in on-time delivery",
            "Maintained 98% documentation accuracy through Dubai Trade and ERP tools"
        ],
        "skills": ["S&OP Planning", "Cross-functional Leadership", "ERP Systems", "3PL Management"],
        "impact": {
            "primary": "30% improvement in forecast accuracy",
            "secondary": "25% improvement in on-time delivery"
        },
        "order": 1,
        "isActive": True
    },
    {
        "id": "global-automobiles-analyst",
        "company": "Global Automobiles",
        "position": "Inventory Operations Analyst",
        "location": "Jamshedpur, India",
        "duration": "April 2022 - October 2022",
        "type": "Previous Role",
        "achievements": [
            "Orchestrated end-to-end spare parts flow, ensuring 98% inventory accuracy",
            "Boosted inventory turnover by 20% and cut holding costs by 15%",
            "Streamlined procurement operations, securing 98% parts availability",
            "Drove operational cost control through improved warehouse layout efficiency"
        ],
        "skills": ["Inventory Management", "Procurement", "Warehouse Operations", "Cost Control"],
        "impact": {
            "primary": "20% improvement in inventory turnover",
            "secondary": "15% reduction in holding costs"
        },
        "order": 2,
        "isActive": True
    }
]

# Projects data
projects_data = [
    {
        "id": "china-mena-gcc-optimization",
        "title": "China-MENA-GCC Supply Chain Optimization",
        "company": "ANDS",
        "category": "Cross-Regional Operations",
        "challenge": "Complex supply chain disruptions across three major regions affecting forecast accuracy and inventory positioning",
        "approach": "Implemented cross-functional S&OP methodology with real-time data integration and strategic vendor consolidation",
        "technologies": ["ERP Systems", "Dubai Trade", "Advanced Analytics", "3PL Management"],
        "outcomes": [
            "30% improvement in forecast accuracy",
            "25% improvement in on-time delivery",
            "30% reduction in air freight costs",
            "20% reduction in customs clearance time"
        ],
        "impact": "Transformed a fragmented supply chain into a cohesive, efficient operation serving multiple markets",
        "testimonial": "Vinayak's strategic approach to cross-regional supply chain management delivered exceptional results in both cost optimization and operational efficiency.",
        "image": "https://images.unsplash.com/photo-1700716465891-9e5e9f501d7d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxzdXBwbHklMjBjaGFpbnxlbnwwfHx8fDE3NTYxNzYzMDV8MA&ixlib=rb-4.1.0&q=85",
        "order": 1,
        "isActive": True
    },
    {
        "id": "high-volume-inventory-management",
        "title": "High-Volume Inventory Flow Management",
        "company": "ANDS",
        "category": "Inventory Optimization",
        "challenge": "Managing 100,000+ units monthly with high aged stock levels and inventory discrepancies",
        "approach": "Implemented lean warehouse practices, safety stock calibration, and structured continuous improvement routines",
        "technologies": ["Lean Practices", "Safety Stock Models", "Warehouse Management", "Real-time Analytics"],
        "outcomes": [
            "18% reduction in aged stock",
            "15% cut in stock discrepancies",
            "100,000+ units managed monthly",
            "98% inventory accuracy maintained"
        ],
        "impact": "Created a scalable inventory management system capable of handling high-volume operations with minimal discrepancies",
        "testimonial": "The inventory optimization strategies implemented by Vinayak significantly improved our operational efficiency and reduced carrying costs.",
        "image": "https://images.unsplash.com/photo-1592085198739-ffcad7f36b54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxzdXBwbHklMjBjaGFpbnxlbnwwfHx8fDE3NTYxNzYzMDV8MA&ixlib=rb-4.1.0&q=85",
        "order": 2,
        "isActive": True
    },
    {
        "id": "automotive-spare-parts-transformation",
        "title": "Automotive Spare Parts Supply Chain Transformation",
        "company": "Global Automobiles",
        "category": "Automotive Supply Chain",
        "challenge": "Inefficient spare parts flow causing stockouts and increased holding costs in automotive operations",
        "approach": "End-to-end process redesign with ERP-driven coordination and demand-aligned procurement strategies",
        "technologies": ["ERP Integration", "Demand Forecasting", "Supplier Management", "Process Automation"],
        "outcomes": [
            "20% improvement in inventory turnover",
            "15% reduction in holding costs",
            "98% parts availability achieved",
            "15% faster sourcing cycles"
        ],
        "impact": "Transformed spare parts operations from reactive to predictive, significantly improving service levels and cost efficiency",
        "testimonial": "Vinayak's systematic approach to spare parts management revolutionized our inventory operations and customer service levels.",
        "image": "https://images.unsplash.com/photo-1599658880436-c61792e70672?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxkYXRhJTIwYW5hbHlzaXN8ZW58MHx8fHwxNzU2MTc2MzEwfDA&ixlib=rb-4.1.0&q=85",
        "order": 3,
        "isActive": True
    }
]

# Skills data
skills_data = [
    {
        "id": "technical-expertise",
        "category": "technical",
        "title": "Technical Expertise",
        "icon": "Database",
        "skills": [
            "ERP Systems (SAP, Oracle)",
            "Supply Chain Analytics",
            "Demand Forecasting",
            "Inventory Optimization",
            "3PL Management",
            "Data Analysis & Visualization"
        ],
        "color": "bg-blue-500",
        "borderColor": "border-blue-200",
        "textColor": "text-blue-700",
        "order": 1
    },
    {
        "id": "operational-excellence",
        "category": "operational",
        "title": "Operational Excellence",
        "icon": "Settings",
        "skills": [
            "S&OP Planning",
            "Cross-functional Leadership",
            "Warehouse Operations",
            "Procurement Strategy",
            "Cost Optimization",
            "Process Improvement"
        ],
        "color": "bg-green-500",
        "borderColor": "border-green-200",
        "textColor": "text-green-700",
        "order": 2
    },
    {
        "id": "regional-expertise",
        "category": "regional",
        "title": "Regional Expertise",
        "icon": "Globe",
        "skills": [
            "MENA Market Expertise",
            "GCC Regulations",
            "Dubai Trade Systems",
            "China-MENA Operations",
            "Multi-cultural Teams",
            "International Logistics"
        ],
        "color": "bg-purple-500",
        "borderColor": "border-purple-200",
        "textColor": "text-purple-700",
        "order": 3
    }
]

# Testimonials data - Real LinkedIn Recommendations
testimonials_data = [
    {
        "id": "dorrin-goyal-testimonial",
        "name": "Dorrin Goyal",
        "position": "Academic Manager",
        "company": "SP Jain School of Global Management",
        "linkedin": "https://linkedin.com/in/dorrin-goyal",
        "content": "I had the privilege of mentoring Vinayak Bhadani in my International Business Research Project course at SP Jain School of Global Management in Singapore. During that time, I was pleased with his dedication to learn. He has strong passion for gaining knowledge. As a student, Vinayak consistently demonstrated good level of intellectual curiosity, and a willingness to engage deeply with complex concepts.",
        "rating": 5,
        "relationship": "Academic Mentor",
        "order": 1,
        "isActive": True
    },
    {
        "id": "rajiv-aserkar-testimonial", 
        "name": "Rajiv Aserkar",
        "position": "Professor - Logistics & Supply Chain Management",
        "company": "SP Jain School of Global Management",
        "linkedin": "https://linkedin.com/in/rajiv-aserkar-supply-chain",
        "content": "It is a pleasure to write this recommendation for Vinayak Bhadani, who was my student at SP Jain School of Global Management. Vinayak specialized in Global Logistics and Supply Chain Management and displayed all the traits to be a successful professional in this domain. He has the required analytical skills, leadership qualities and he is a fine team player. He completed all his course work and projects with dedication and commitment.",
        "rating": 5,
        "relationship": "Academic Professor",
        "order": 2,
        "isActive": True
    },
    {
        "id": "sami-anthony-testimonial",
        "name": "Sami Anthony Abu-Hanna",
        "position": "Head of Operations/Supply Chain",
        "company": "ANDS | MBA, PMP®, CFM®",
        "linkedin": "https://linkedin.com/in/sami-anthony-abu-hanna",
        "content": "I am pleased to recommend Vinayak Bhadani, who served as a Supply Chain Analyst at ANDS for 15 months. During this time, he played a key role in improving the S&OP process, optimizing logistics, and enhancing ERP systems. Vinayak's analytical skills, adaptability, and problem-solving abilities made him a valuable asset to the team. He consistently delivered results and collaborated effectively across teams to achieve shared goals.",
        "rating": 5,
        "relationship": "Direct Manager",
        "order": 3,
        "isActive": True
    },
    {
        "id": "additional-recommendation-4",
        "name": "[Name from Screenshot 4]",
        "position": "[Position from Screenshot 4]", 
        "company": "[Company from Screenshot 4]",
        "linkedin": "https://linkedin.com/in/placeholder",
        "content": "[Please replace with content from IMG_6860.jpg]",
        "rating": 5,
        "relationship": "[Relationship from Screenshot]",
        "order": 4,
        "isActive": True
    }
]

async def seed_database():
    """Seed the database with initial data"""
    try:
        print("Starting database seeding...")
        
        # Clear existing data
        await db.profiles.delete_many({})
        await db.experience.delete_many({})
        await db.projects.delete_many({})
        await db.skills.delete_many({})
        await db.testimonials.delete_many({})
        print("Cleared existing data")
        
        # Insert profile data
        await db.profiles.insert_one(profile_data)
        print("Inserted profile data")
        
        # Insert experience data
        await db.experience.insert_many(experience_data)
        print(f"Inserted {len(experience_data)} experience records")
        
        # Insert projects data
        await db.projects.insert_many(projects_data)
        print(f"Inserted {len(projects_data)} project records")
        
        # Insert skills data
        await db.skills.insert_many(skills_data)
        print(f"Inserted {len(skills_data)} skill categories")
        
        # Insert testimonials data
        await db.testimonials.insert_many(testimonials_data)
        print(f"Inserted {len(testimonials_data)} testimonials")
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())