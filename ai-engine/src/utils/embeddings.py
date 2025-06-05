"""
Embeddings Utility Module
Provides functions for generating embeddings and vector operations.
"""

import os
from typing import List, Dict, Any, Optional
import asyncio
import logging
import numpy as np

from langchain_community.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

from .config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI embeddings
embeddings = None

async def init_embeddings():
    """Initialize embeddings."""
    global embeddings
    
    if Config.OPENAI_API_KEY:
        embeddings = OpenAIEmbeddings(
            openai_api_key=Config.OPENAI_API_KEY
        )
        logger.info("OpenAI embeddings initialized")
    else:
        logger.warning("OpenAI API key not found. Embeddings functionality will be limited.")

async def get_embedding(text: str) -> Optional[List[float]]:
    """
    Get embedding for a text.
    
    Args:
        text: The text to embed
        
    Returns:
        The embedding vector or None if embeddings are not initialized
    """
    if embeddings is None:
        logger.error("Embeddings not initialized")
        return None
    
    try:
        # Get embedding from OpenAI
        embedding = await asyncio.to_thread(
            embeddings.embed_query,
            text
        )
        
        return embedding
        
    except Exception as e:
        logger.error(f"Failed to get embedding: {e}")
        return None

async def get_embeddings_batch(texts: List[str]) -> Optional[List[List[float]]]:
    """
    Get embeddings for a batch of texts.
    
    Args:
        texts: The texts to embed
        
    Returns:
        The embedding vectors or None if embeddings are not initialized
    """
    if embeddings is None:
        logger.error("Embeddings not initialized")
        return None
    
    try:
        # Get embeddings from OpenAI
        embeddings_batch = await asyncio.to_thread(
            embeddings.embed_documents,
            texts
        )
        
        return embeddings_batch
        
    except Exception as e:
        logger.error(f"Failed to get embeddings batch: {e}")
        return None

async def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """
    Split text into chunks for embedding.
    
    Args:
        text: The text to split
        chunk_size: The size of each chunk
        chunk_overlap: The overlap between chunks
        
    Returns:
        A list of text chunks
    """
    try:
        # Initialize text splitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len
        )
        
        # Split text
        chunks = await asyncio.to_thread(
            text_splitter.split_text,
            text
        )
        
        return chunks
        
    except Exception as e:
        logger.error(f"Failed to chunk text: {e}")
        return [text]

def cosine_similarity(vector_a: List[float], vector_b: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors.
    
    Args:
        vector_a: First vector
        vector_b: Second vector
        
    Returns:
        Cosine similarity (0-1)
    """
    try:
        # Convert to numpy arrays
        a = np.array(vector_a)
        b = np.array(vector_b)
        
        # Calculate cosine similarity
        similarity = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
        
        return float(similarity)
        
    except Exception as e:
        logger.error(f"Failed to calculate cosine similarity: {e}")
        return 0.0

def find_most_similar(query_vector: List[float], vectors: List[List[float]]) -> int:
    """
    Find the index of the most similar vector.
    
    Args:
        query_vector: The query vector
        vectors: The vectors to compare against
        
    Returns:
        The index of the most similar vector
    """
    try:
        # Calculate similarities
        similarities = [cosine_similarity(query_vector, vector) for vector in vectors]
        
        # Find index of maximum similarity
        max_index = similarities.index(max(similarities))
        
        return max_index
        
    except Exception as e:
        logger.error(f"Failed to find most similar vector: {e}")
        return 0
