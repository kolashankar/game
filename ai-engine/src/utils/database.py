"""
Database Utility Module
Provides database connection and operations for the AI engine.
"""

import os
import asyncio
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

import pymongo
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

# Mock Pinecone implementation for development
class MockPineconeIndex:
    def __init__(self, name):
        self.name = name
        self.vectors = {}
        
    def upsert(self, vectors):
        for id, vector, metadata in vectors:
            self.vectors[id] = (vector, metadata)
        return True
        
    def query(self, vector, top_k=5, include_metadata=True):
        # Mock query results
        class MockQueryResult:
            def __init__(self):
                self.matches = []
                
        return MockQueryResult()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global database connections
mongodb_client = None
pinecone_client = None
pinecone_index = None

async def init_db():
    """Initialize database connections."""
    await init_mongodb()
    await init_pinecone()

async def init_mongodb():
    """Initialize MongoDB connection."""
    global mongodb_client
    
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://mongodb:27017/chronocore_ai")
    
    try:
        # Connect to MongoDB
        mongodb_client = MongoClient(mongodb_uri)
        
        # Verify connection
        await asyncio.to_thread(mongodb_client.admin.command, 'ping')
        logger.info("Successfully connected to MongoDB")
        
        # Get database name from URI or use default
        db_name = os.getenv("MONGODB_DATABASE", "chronocore_ai")
        
        # Get database with explicit name
        db = mongodb_client[db_name]
        
        # Player collection indexes
        await asyncio.to_thread(
            db.players.create_index, [("player_id", pymongo.ASCENDING)], unique=True
        )
        await asyncio.to_thread(
            db.players.create_index, [("user_id", pymongo.ASCENDING)]
        )
        
        # Game state collection indexes
        await asyncio.to_thread(
            db.game_states.create_index, [("game_id", pymongo.ASCENDING)], unique=True
        )
        
        # Quest collection indexes
        await asyncio.to_thread(
            db.quests.create_index, [("quest_id", pymongo.ASCENDING)], unique=True
        )
        await asyncio.to_thread(
            db.quests.create_index, [("player_id", pymongo.ASCENDING)]
        )
        
        # Decision history collection indexes
        await asyncio.to_thread(
            db.decisions.create_index, [("player_id", pymongo.ASCENDING)]
        )
        await asyncio.to_thread(
            db.decisions.create_index, [("game_id", pymongo.ASCENDING)]
        )
        
        logger.info(f"MongoDB indexes created in database '{db_name}'")
        
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise
    except OperationFailure as e:
        logger.error(f"MongoDB operation failed: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error with MongoDB: {e}")
        raise

async def init_pinecone():
    """Initialize Pinecone connection."""
    global pinecone_index
    
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    
    if not pinecone_api_key:
        logger.warning("Pinecone API key not found. Using mock implementation.")
    
    try:
        # Use mock implementation for development
        index_name = "chronocore-ai"
        
        # Create a mock index
        pinecone_index = MockPineconeIndex(index_name)
        logger.info(f"Created mock Pinecone index: {index_name}")
        
    except Exception as e:
        logger.error(f"Failed to initialize Pinecone: {e}")
        pinecone_client = None
        pinecone_index = None

async def save_game_state(game_state: Dict) -> bool:
    """
    Save a game state to the database.
    
    Args:
        game_state: The game state to save
        
    Returns:
        True if successful, False otherwise
    """
    if mongodb_client is None:
        logger.error("MongoDB client not initialized")
        return False
    
    try:
        db_name = os.getenv("MONGODB_DATABASE", "chronocore_ai")
        db = mongodb_client[db_name]
        
        # Add timestamp
        game_state["updated_at"] = datetime.now()
        
        # Insert or update game state
        result = await asyncio.to_thread(
            db.game_states.update_one,
            {"game_id": game_state["game_id"]},
            {"$set": game_state},
            upsert=True
        )
        
        return result.acknowledged
        
    except Exception as e:
        logger.error(f"Failed to save game state: {e}")
        return False

async def get_game_state(game_id: str) -> Optional[Dict]:
    """
    Get a game state from the database.
    
    Args:
        game_id: The ID of the game state to retrieve
        
    Returns:
        The game state or None if not found
    """
    if mongodb_client is None:
        logger.error("MongoDB client not initialized")
        return None
    
    try:
        db_name = os.getenv("MONGODB_DATABASE", "chronocore_ai")
        db = mongodb_client[db_name]
        
        game_state = await asyncio.to_thread(
            db.game_states.find_one,
            {"game_id": game_id}
        )
        
        return game_state
        
    except Exception as e:
        logger.error(f"Failed to get game state: {e}")
        return None

async def save_player(player: Dict) -> bool:
    """
    Save a player to the database.
    
    Args:
        player: The player to save
        
    Returns:
        True if successful, False otherwise
    """
    if mongodb_client is None:
        logger.error("MongoDB client not initialized")
        return False
    
    try:
        db_name = os.getenv("MONGODB_DATABASE", "chronocore_ai")
        db = mongodb_client[db_name]
        
        # Add timestamp
        player["updated_at"] = datetime.now()
        
        # Insert or update player
        result = await asyncio.to_thread(
            db.players.update_one,
            {"player_id": player["player_id"]},
            {"$set": player},
            upsert=True
        )
        
        return result.acknowledged
        
    except Exception as e:
        logger.error(f"Failed to save player: {e}")
        return False

async def get_player(player_id: str) -> Optional[Dict]:
    """
    Get a player from the database.
    
    Args:
        player_id: The ID of the player to retrieve
        
    Returns:
        The player or None if not found
    """
    if mongodb_client is None:
        logger.error("MongoDB client not initialized")
        return None
    
    try:
        db_name = os.getenv("MONGODB_DATABASE", "chronocore_ai")
        db = mongodb_client[db_name]
        
        player = await asyncio.to_thread(
            db.players.find_one,
            {"player_id": player_id}
        )
        
        return player
        
    except Exception as e:
        logger.error(f"Failed to get player: {e}")
        return None

async def save_quest(quest: Dict) -> bool:
    """
    Save a quest to the database.
    
    Args:
        quest: The quest to save
        
    Returns:
        True if successful, False otherwise
    """
    if mongodb_client is None:
        logger.error("MongoDB client not initialized")
        return False
    
    try:
        db = mongodb_client.get_database()
        
        # Add timestamp
        quest["updated_at"] = datetime.now()
        
        # Insert or update quest
        result = await asyncio.to_thread(
            db.quests.update_one,
            {"quest_id": quest["quest_id"]},
            {"$set": quest},
            upsert=True
        )
        
        return result.acknowledged
        
    except Exception as e:
        logger.error(f"Failed to save quest: {e}")
        return False

async def get_quest(quest_id: str) -> Optional[Dict]:
    """
    Get a quest from the database.
    
    Args:
        quest_id: The ID of the quest to retrieve
        
    Returns:
        The quest or None if not found
    """
    if mongodb_client is None:
        logger.error("MongoDB client not initialized")
        return None
    
    try:
        db = mongodb_client.get_database()
        
        quest = await asyncio.to_thread(
            db.quests.find_one,
            {"quest_id": quest_id}
        )
        
        return quest
        
    except Exception as e:
        logger.error(f"Failed to get quest: {e}")
        return None

async def get_player_quests(player_id: str) -> List[Dict]:
    """
    Get all quests for a player.
    
    Args:
        player_id: The ID of the player
        
    Returns:
        A list of quests
    """
    if mongodb_client is None:
        logger.error("MongoDB client not initialized")
        return []
    
    try:
        db_name = os.getenv("MONGODB_DATABASE", "chronocore_ai")
        db = mongodb_client[db_name]
        
        quests = await asyncio.to_thread(
            lambda: list(db.quests.find({"player_id": player_id}))
        )
        
        return quests
        
    except Exception as e:
        logger.error(f"Failed to get player quests: {e}")
        return []

async def save_decision(decision: Dict) -> bool:
    """
    Save a decision to the database.
    
    Args:
        decision: The decision to save
        
    Returns:
        True if successful, False otherwise
    """
    if mongodb_client is None:
        logger.error("MongoDB client not initialized")
        return False
    
    try:
        db_name = os.getenv("MONGODB_DATABASE", "chronocore_ai")
        db = mongodb_client[db_name]
        
        # Add timestamp if not present
        if "timestamp" not in decision:
            decision["timestamp"] = datetime.now()
        
        # Insert decision
        result = await asyncio.to_thread(
            db.decisions.insert_one,
            decision
        )
        
        return result.acknowledged
        
    except Exception as e:
        logger.error(f"Failed to save decision: {e}")
        return False

async def get_player_decisions(player_id: str, limit: int = 20) -> List[Dict]:
    """
    Get recent decisions for a player.
    
    Args:
        player_id: The ID of the player
        limit: Maximum number of decisions to retrieve
        
    Returns:
        A list of decisions
    """
    if mongodb_client is None:
        logger.error("MongoDB client not initialized")
        return []
    
    try:
        db_name = os.getenv("MONGODB_DATABASE", "chronocore_ai")
        db = mongodb_client[db_name]
        
        decisions = await asyncio.to_thread(
            lambda: list(
                db.decisions.find(
                    {"player_id": player_id}
                ).sort("timestamp", pymongo.DESCENDING).limit(limit)
            )
        )
        
        return decisions
        
    except Exception as e:
        logger.error(f"Failed to get player decisions: {e}")
        return []

async def store_vector(id: str, vector: List[float], metadata: Dict) -> bool:
    """
    Store a vector in Pinecone.
    
    Args:
        id: The ID for the vector
        vector: The vector to store
        metadata: Metadata to associate with the vector
        
    Returns:
        True if successful, False otherwise
    """
    if pinecone_index is None:
        logger.error("Pinecone index not initialized")
        return False
    
    try:
        # Upsert the vector
        result = await asyncio.to_thread(
            lambda: pinecone_index.upsert(
                vectors=[(id, vector, metadata)]
            )
        )
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to store vector: {e}")
        return False

async def query_vectors(query_vector: List[float], top_k: int = 5) -> List[Dict]:
    """
    Query vectors in Pinecone.
    
    Args:
        query_vector: The query vector
        top_k: Number of results to return
        
    Returns:
        A list of matching vectors with metadata
    """
    if pinecone_index is None:
        logger.error("Pinecone index not initialized")
        return []
    
    try:
        # Query the index
        results = await asyncio.to_thread(
            lambda: pinecone_index.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True
            )
        )
        
        return results.matches
        
    except Exception as e:
        logger.error(f"Failed to query vectors: {e}")
        return []

async def close_connections():
    """Close database connections."""
    global mongodb_client
    
    if mongodb_client is not None:
        await asyncio.to_thread(mongodb_client.close)
        mongodb_client = None
        logger.info("MongoDB connection closed")
    
    # Pinecone doesn't require explicit connection closing
