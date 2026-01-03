from sqlalchemy import Column, Integer, String, Boolean
from app.services.database import Base

class Integration(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String)  # "google", "whatsapp"
    is_connected = Column(Boolean, default=False)
    auth_type = Column(String)     # "oauth2" or "apikey"