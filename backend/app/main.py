from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import workflows, log, integrations
from app.services.database import engine, Base

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Automation Engine API",
    version="1.0.0",
    redirect_slashes=False
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(log.router, prefix="/api/logs", tags=["logs"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["integrations"])

@app.get("/")
async def root():
    return {
        "message": "Automation Engine API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}