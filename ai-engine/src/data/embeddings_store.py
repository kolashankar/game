"""
Embeddings Store
Manages storage and retrieval of vector embeddings for semantic search and similarity matching.
"""

import os
import json
import asyncio
import logging
from typing import List, Dict, Any, Optional
import numpy as np

from ..utils.embeddings import get_embedding, cosine_similarity
from ..utils.database import store_vector, query_vectors
from ..utils.config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingsStore:
    """
    Manages storage and retrieval of vector embeddings for the ChronoCore AI engine.
    Provides an abstraction layer over the vector database (Pinecone).
    """
    
    def __init__(self):
        """Initialize the embeddings store."""
        self.cache = {}  # Local cache for frequently accessed embeddings
    
    async def store_embedding(self, id: str, text: str, metadata: Dict) -> bool:
        """
        Generate an embedding for text and store it in the vector database.
        
        Args:
            id: Unique identifier for the embedding
            text: Text to generate embedding for
            metadata: Additional metadata to store with the embedding
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Generate embedding
            embedding = await get_embedding(text)
            
            if embedding is None:
                logger.error(f"Failed to generate embedding for text: {text[:50]}...")
                return False
            
            # Store in cache
            self.cache[id] = {
                "embedding": embedding,
                "metadata": metadata
            }
            
            # Store in vector database
            success = await store_vector(id, embedding, metadata)
            
            return success
        
        except Exception as e:
            logger.error(f"Error storing embedding: {e}")
            return False
    
    async def find_similar(self, query_text: str, top_k: int = 5) -> List[Dict]:
        """
        Find items similar to the query text.
        
        Args:
            query_text: Text to find similar items for
            top_k: Number of results to return
            
        Returns:
            List of similar items with their metadata and similarity scores
        """
        try:
            # Generate embedding for query
            query_embedding = await get_embedding(query_text)
            
            if query_embedding is None:
                logger.error(f"Failed to generate embedding for query: {query_text[:50]}...")
                return []
            
            # Query vector database
            results = await query_vectors(query_embedding, top_k)
            
            return results
        
        except Exception as e:
            logger.error(f"Error finding similar items: {e}")
            return []
    
    async def compare_texts(self, text_a: str, text_b: str) -> float:
        """
        Compare two texts and return their similarity score.
        
        Args:
            text_a: First text
            text_b: Second text
            
        Returns:
            Similarity score between 0 and 1
        """
        try:
            # Generate embeddings
            embedding_a = await get_embedding(text_a)
            embedding_b = await get_embedding(text_b)
            
            if embedding_a is None or embedding_b is None:
                logger.error("Failed to generate embeddings for comparison")
                return 0.0
            
            # Calculate similarity
            similarity = cosine_similarity(embedding_a, embedding_b)
            
            return similarity
        
        except Exception as e:
            logger.error(f"Error comparing texts: {e}")
            return 0.0
    
    async def store_game_context(self, game_id: str, context: Dict) -> bool:
        """
        Store game context for semantic search and retrieval.
        
        Args:
            game_id: ID of the game
            context: Game context data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Create a combined text representation of the game context
            context_text = f"""
            Game ID: {game_id}
            Current Era: {context.get('current_era', 'Unknown')}
            Players: {', '.join([p.get('name', 'Unknown') for p in context.get('players', [])])}
            Timelines: {len(context.get('timelines', []))}
            Realms: {len(context.get('realms', []))}
            Global Karma: {context.get('global_karma', 0)}
            Recent Events: {'; '.join([e.get('description', '') for e in context.get('events_history', [])[-5:]])}
            """
            
            # Store embedding
            success = await self.store_embedding(
                id=f"game_context:{game_id}",
                text=context_text,
                metadata={
                    "type": "game_context",
                    "game_id": game_id,
                    "context": context
                }
            )
            
            return success
        
        except Exception as e:
            logger.error(f"Error storing game context: {e}")
            return False
    
    async def find_relevant_game_contexts(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Find game contexts relevant to a query.
        
        Args:
            query: Query text
            top_k: Number of results to return
            
        Returns:
            List of relevant game contexts
        """
        try:
            results = await self.find_similar(query, top_k)
            
            # Filter for game contexts only
            game_contexts = [
                result for result in results
                if result.get('metadata', {}).get('type') == 'game_context'
            ]
            
            return game_contexts
        
        except Exception as e:
            logger.error(f"Error finding relevant game contexts: {e}")
            return []
