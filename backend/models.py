from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

# Personal Information Models
class SocialProof(BaseModel):
    experience: str
    unitsManaged: str
    costReduction: str
    accuracyRate: str

class PersonalInfo(BaseModel):
    name: str
    title: str
    location: str
    phone: str
    email: str
    linkedin: str
    heroImage: Optional[str] = None

class HeroSection(BaseModel):
    tagline: str
    description: str
    socialProof: SocialProof

class StorySection(BaseModel):
    challenge: str
    journey: str
    breakthrough: str
    impact: str
    future: str

class AboutSection(BaseModel):
    story: StorySection
    philosophy: str

class ContactSection(BaseModel):
    cta: str
    description: str
    availability: str

class Profile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    personal: PersonalInfo
    hero: HeroSection
    about: AboutSection
    contact: ContactSection
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)

# Experience Models
class ImpactMetrics(BaseModel):
    primary: str
    secondary: str

class Experience(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str
    position: str
    location: str
    duration: str
    type: str  # "Current Role" | "Previous Role"
    achievements: List[str]
    skills: List[str]
    impact: ImpactMetrics
    order: int = 0
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ExperienceCreate(BaseModel):
    company: str
    position: str
    location: str
    duration: str
    type: str
    achievements: List[str]
    skills: List[str]
    impact: ImpactMetrics
    order: int = 0

# Projects Models  
class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    category: str
    challenge: str
    approach: str
    technologies: List[str]
    outcomes: List[str]
    impact: str
    testimonial: str
    image: str
    order: int = 0
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ProjectCreate(BaseModel):
    title: str
    company: str
    category: str
    challenge: str
    approach: str
    technologies: List[str]
    outcomes: List[str]
    impact: str
    testimonial: str
    image: str
    order: int = 0

# Skills Models
class SkillCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str  # "technical" | "operational" | "regional"
    title: str
    icon: str
    skills: List[str]
    color: str
    borderColor: str
    textColor: str
    order: int = 0
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class SkillCategoryCreate(BaseModel):
    category: str
    title: str
    icon: str
    skills: List[str]
    color: str
    borderColor: str
    textColor: str
    order: int = 0

# Testimonials Models
class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    position: str
    company: str
    linkedin: str
    content: str
    rating: int = Field(ge=1, le=5)
    relationship: str
    isActive: bool = True
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class TestimonialCreate(BaseModel):
    name: str
    position: str
    company: str
    linkedin: str
    content: str
    rating: int = Field(ge=1, le=5)
    relationship: str
    order: int = 0

# Contact Models
class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    company: Optional[str] = None
    message: str
    isRead: bool = False
    respondedAt: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    message: str

# Response Models
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class PaginatedResponse(BaseModel):
    success: bool
    data: List[dict]
    total: int
    page: int
    limit: int