from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Optional

# Import models
from models import (
    Profile, Experience, ExperienceCreate, Project, ProjectCreate,
    SkillCategory, SkillCategoryCreate, Testimonial, TestimonialCreate,
    ContactMessage, ContactMessageCreate, ApiResponse
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Vinayak Bhadani Portfolio API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Profile endpoints
@api_router.get("/profile")
async def get_profile():
    """Get the main profile information"""
    try:
        profile = await db.profiles.find_one({"id": "vinayak-bhadani-profile"})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Remove MongoDB _id from response
        profile.pop('_id', None)
        return {
            "success": True,
            "data": profile
        }
    except Exception as e:
        logging.error(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Experience endpoints
@api_router.get("/experience")
async def get_experience():
    """Get all experience entries"""
    try:
        experience_list = await db.experience.find(
            {"isActive": True}
        ).sort("order", 1).to_list(100)
        
        # Remove MongoDB _id from each record
        for exp in experience_list:
            exp.pop('_id', None)
        
        return {
            "success": True,
            "data": experience_list
        }
    except Exception as e:
        logging.error(f"Error fetching experience: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/experience/{experience_id}")
async def get_experience_by_id(experience_id: str):
    """Get specific experience by ID"""
    try:
        experience = await db.experience.find_one({"id": experience_id, "isActive": True})
        if not experience:
            raise HTTPException(status_code=404, detail="Experience not found")
        
        experience.pop('_id', None)
        return {
            "success": True,
            "data": experience
        }
    except Exception as e:
        logging.error(f"Error fetching experience {experience_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Projects endpoints
@api_router.get("/projects")
async def get_projects():
    """Get all active projects"""
    try:
        projects_list = await db.projects.find(
            {"isActive": True}
        ).sort("order", 1).to_list(100)
        
        # Remove MongoDB _id from each record
        for project in projects_list:
            project.pop('_id', None)
        
        return {
            "success": True,
            "data": projects_list
        }
    except Exception as e:
        logging.error(f"Error fetching projects: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/projects/{project_id}")
async def get_project_by_id(project_id: str):
    """Get specific project by ID"""
    try:
        project = await db.projects.find_one({"id": project_id, "isActive": True})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project.pop('_id', None)
        return {
            "success": True,
            "data": project
        }
    except Exception as e:
        logging.error(f"Error fetching project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Skills endpoints
@api_router.get("/skills")
async def get_skills():
    """Get all skill categories"""
    try:
        skills_list = await db.skills.find({}).sort("order", 1).to_list(100)
        
        # Remove MongoDB _id from each record
        for skill in skills_list:
            skill.pop('_id', None)
        
        return {
            "success": True,
            "data": skills_list
        }
    except Exception as e:
        logging.error(f"Error fetching skills: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Testimonials endpoints
@api_router.get("/testimonials")
async def get_testimonials():
    """Get all active testimonials"""
    try:
        testimonials_list = await db.testimonials.find(
            {"isActive": True}
        ).sort("order", 1).to_list(100)
        
        # Remove MongoDB _id from each record
        for testimonial in testimonials_list:
            testimonial.pop('_id', None)
        
        return {
            "success": True,
            "data": testimonials_list
        }
    except Exception as e:
        logging.error(f"Error fetching testimonials: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Contact endpoints
@api_router.post("/contact")
async def submit_contact_message(message: ContactMessageCreate, request: Request):
    """Submit a new contact message"""
    try:
        # Create contact message with metadata
        contact_data = message.dict()
        contact_data["id"] = f"contact-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
        contact_data["createdAt"] = datetime.utcnow()
        contact_data["isRead"] = False
        contact_data["ipAddress"] = request.client.host
        contact_data["userAgent"] = request.headers.get("user-agent", "")
        
        # Insert into database
        result = await db.contact_messages.insert_one(contact_data)
        
        return {
            "success": True,
            "message": "Message sent successfully! I'll get back to you within 24 hours.",
            "data": {"id": contact_data["id"]}
        }
    except Exception as e:
        logging.error(f"Error submitting contact message: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")

@api_router.get("/contact/messages")
async def get_contact_messages(limit: int = 50, skip: int = 0):
    """Get contact messages (admin endpoint)"""
    try:
        messages = await db.contact_messages.find({}).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
        total = await db.contact_messages.count_documents({})
        
        # Remove MongoDB _id from each record
        for message in messages:
            message.pop('_id', None)
        
        return {
            "success": True,
            "data": messages,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        logging.error(f"Error fetching contact messages: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Vinayak Bhadani Portfolio API is running", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        await db.profiles.find_one({"id": "vinayak-bhadani-profile"})
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Startup event to seed database if needed"""
    try:
        # Check if profile exists, if not seed the database
        profile = await db.profiles.find_one({"id": "vinayak-bhadani-profile"})
        if not profile:
            logger.info("Profile not found, seeding database...")
            from seed_data import seed_database
            await seed_database()
            logger.info("Database seeded successfully")
        else:
            logger.info("Profile found, database already seeded")
    except Exception as e:
        logger.error(f"Error during startup: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
