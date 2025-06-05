"""
Embedding Utilities
Provides functions for creating and managing embeddings for the AI engine
"""

import os
import numpy as np
from typing import List, Dict, Any, Optional, Union
import openai
from langchain.embeddings import OpenAIEmbeddings
from pinecone import Pinecone, ServerlessSpec
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingManager:
    """Manages embeddings for the AI engine"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "text-embedding-ada-002"):
        """
        Initialize the embedding manager
        
        Args:
            api_key: OpenAI API key (defaults to environment variable)
            model: Embedding model to use
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        self.model = model
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=self.api_key,
            model=self.model
        )
        
        # Initialize Pinecone client if credentials are available
        self.pinecone_api_key = os.getenv("PINECONE_API_KEY")
        self.pinecone_environment = os.getenv("PINECONE_ENVIRONMENT", "us-west1-gcp")
        self.pinecone_index_name = os.getenv("PINECONE_INDEX", "chronocore-ai")
        
        self.pinecone = None
        self.index = None
        if self.pinecone_api_key:
            self._init_pinecone()
    
    def _init_pinecone(self):
        """Initialize Pinecone client and index"""
        try:
            self.pinecone = Pinecone(api_key=self.pinecone_api_key)
            
            # Check if index exists
            if self.pinecone_index_name not in self.pinecone.list_indexes().names():
                logger.info(f"Creating Pinecone index: {self.pinecone_index_name}")
                self.pinecone.create_index(
                    name=self.pinecone_index_name,
                    dimension=1536,  # OpenAI embedding dimension
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-west-2")
                )
            
            self.index = self.pinecone.Index(self.pinecone_index_name)
            logger.info(f"Connected to Pinecone index: {self.pinecone_index_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {str(e)}")
            self.pinecone = None
            self.index = None
    
    def create_embedding(self, text: str) -> List[float]:
        """
        Create an embedding for the given text
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        try:
            embedding = self.embeddings.embed_query(text)
            return embedding
        except Exception as e:
            logger.error(f"Error creating embedding: {str(e)}")
            raise
    
    def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Create embeddings for multiple texts
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        try:
            embeddings = self.embeddings.embed_documents(texts)
            return embeddings
        except Exception as e:
            logger.error(f"Error creating embeddings: {str(e)}")
            raise
    
    def store_vector(self, id: str, vector: List[float], metadata: Dict[str, Any]) -> bool:
        """
        Store a vector in Pinecone
        
        Args:
            id: Unique ID for the vector
            vector: Embedding vector
            metadata: Metadata for the vector
            
        Returns:
            Success status
        """
        if not self.index:
            logger.warning("Pinecone index not initialized")
            return False
        
        try:
            self.index.upsert(
                vectors=[(id, vector, metadata)],
                namespace="default"
            )
            return True
        except Exception as e:
            logger.error(f"Error storing vector in Pinecone: {str(e)}")
            return False
    
    def query_vectors(self, 
                     vector: List[float], 
                     top_k: int = 5, 
                     filter: Optional[Dict[str, Any]] = None,
                     namespace: str = "default") -> List[Dict[str, Any]]:
        """
        Query vectors in Pinecone
        
        Args:
            vector: Query vector
            top_k: Number of results to return
            filter: Metadata filter
            namespace: Pinecone namespace
            
        Returns:
            List of matching vectors with metadata
        """
        if not self.index:
            logger.warning("Pinecone index not initialized")
            return []
        
        try:
            results = self.index.query(
                vector=vector,
                top_k=top_k,
                include_metadata=True,
                filter=filter,
                namespace=namespace
            )
            
            return results.matches
        except Exception as e:
            logger.error(f"Error querying vectors in Pinecone: {str(e)}")
            return []
    
    def find_similar_texts(self, 
                          query: str, 
                          texts: List[str], 
                          top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Find similar texts without using Pinecone
        
        Args:
            query: Query text
            texts: List of texts to search
            top_k: Number of results to return
            
        Returns:
            List of similar texts with scores
        """
        try:
            # Create embeddings
            query_embedding = self.create_embedding(query)
            text_embeddings = self.create_embeddings(texts)
            
            # Calculate similarities
            similarities = []
            for i, embedding in enumerate(text_embeddings):
                similarity = self._cosine_similarity(query_embedding, embedding)
                similarities.append({
                    "id": i,
                    "text": texts[i],
                    "score": similarity
                })
            
            # Sort by similarity score (descending)
            similarities.sort(key=lambda x: x["score"], reverse=True)
            
            # Return top_k results
            return similarities[:top_k]
        except Exception as e:
            logger.error(f"Error finding similar texts: {str(e)}")
            return []
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors
        
        Args:
            a: First vector
            b: Second vector
            
        Returns:
            Cosine similarity (0-1)
        """
        a = np.array(a)
        b = np.array(b)
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def delete_vectors(self, 
                      ids: Optional[List[str]] = None, 
                      filter: Optional[Dict[str, Any]] = None,
                      namespace: str = "default") -> bool:
        """
        Delete vectors from Pinecone
        
        Args:
            ids: List of vector IDs to delete
            filter: Metadata filter for vectors to delete
            namespace: Pinecone namespace
            
        Returns:
            Success status
        """
        if not self.index:
            logger.warning("Pinecone index not initialized")
            return False
        
        try:
            if ids:
                self.index.delete(ids=ids, namespace=namespace)
            elif filter:
                self.index.delete(filter=filter, namespace=namespace)
            else:
                logger.warning("Either ids or filter must be provided for deletion")
                return False
            
            return True
        except Exception as e:
            logger.error(f"Error deleting vectors from Pinecone: {str(e)}")
            return False
