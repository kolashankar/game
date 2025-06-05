"""
Configuration Utility Module
Manages configuration settings for the AI engine.
"""

import os
from typing import Dict, Any, Optional
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Config:
    """Configuration manager for the AI engine."""
    
    # OpenAI API settings
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4")
    OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
    OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "500"))
    
    # MongoDB settings
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://kolashankar113:***REMOVED***@cluster0.zfgsqlm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    
    # Pinecone settings
    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
    PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-west1-gcp")
    PINECONE_INDEX = os.getenv("PINECONE_INDEX", "chronocore-ai")
    
    # Application settings
    PORT = int(os.getenv("PORT", "8000"))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    # Game settings
    DEFAULT_KARMA_RANGE = (-10, 10)
    MAX_TECH_LEVEL = 10
    MAX_DEVELOPMENT_LEVEL = 5
    MAX_STABILITY = 100
    
    @classmethod
    def validate(cls) -> bool:
        """
        Validate that all required configuration is present.
        
        Returns:
            True if all required configuration is present, False otherwise
        """
        required_vars = [
            "OPENAI_API_KEY"
        ]
        
        missing_vars = [var for var in required_vars if getattr(cls, var) is None]
        
        if missing_vars:
            logger.error(f"Missing required configuration variables: {', '.join(missing_vars)}")
            return False
        
        return True
    
    @classmethod
    def get_openai_config(cls) -> Dict[str, Any]:
        """
        Get OpenAI configuration.
        
        Returns:
            Dictionary of OpenAI configuration
        """
        return {
            "api_key": cls.OPENAI_API_KEY,
            "model": cls.OPENAI_MODEL,
            "temperature": cls.OPENAI_TEMPERATURE,
            "max_tokens": cls.OPENAI_MAX_TOKENS
        }
    
    @classmethod
    def get_mongodb_config(cls) -> Dict[str, Any]:
        """
        Get MongoDB configuration.
        
        Returns:
            Dictionary of MongoDB configuration
        """
        return {
            "uri": cls.MONGODB_URI
        }
    
    @classmethod
    def get_pinecone_config(cls) -> Dict[str, Any]:
        """
        Get Pinecone configuration.
        
        Returns:
            Dictionary of Pinecone configuration
        """
        return {
            "api_key": cls.PINECONE_API_KEY,
            "environment": cls.PINECONE_ENVIRONMENT,
            "index": cls.PINECONE_INDEX
        }
    
    @classmethod
    def get_game_config(cls) -> Dict[str, Any]:
        """
        Get game configuration.
        
        Returns:
            Dictionary of game configuration
        """
        return {
            "karma_range": cls.DEFAULT_KARMA_RANGE,
            "max_tech_level": cls.MAX_TECH_LEVEL,
            "max_development_level": cls.MAX_DEVELOPMENT_LEVEL,
            "max_stability": cls.MAX_STABILITY
        }
