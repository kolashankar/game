"""
Decision Model
Handles evaluation of player decisions and their impacts on the game world
"""

import json
import asyncio
from typing import Dict, Any, List, Optional
import logging
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
from ..data.training.decision_prompts import get_decision_evaluation_prompt
from ..utils.config import Config
from ..utils.embedding_utils import EmbeddingManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DecisionModel:
    """Model for evaluating player decisions"""
    
    def __init__(self):
        """Initialize the decision model"""
        # Load configuration
        self.config = Config.get_openai_config()
        self.game_config = Config.get_game_config()
        
        # Initialize OpenAI LLM
        self.llm = ChatOpenAI(
            model_name=self.config["model"],
            temperature=self.config["temperature"],
            openai_api_key=self.config["api_key"]
        )
        
        # Initialize embedding manager
        self.embedding_manager = EmbeddingManager()
        
        # Create decision evaluation chain
        self.decision_template = PromptTemplate(
            input_variables=["player_id", "player_role", "player_karma", 
                            "current_era", "current_turn", "timeline_stability",
                            "context", "decision"],
            template=get_decision_evaluation_prompt({}, {}, "", {})
        )
        
        self.decision_chain = LLMChain(
            llm=self.llm,
            prompt=self.decision_template,
            verbose=True
        )
        
        logger.info("Decision model initialized")
    
    async def evaluate_decision(self, 
                              player_data: Dict[str, Any], 
                              game_data: Dict[str, Any],
                              decision: str, 
                              context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate a player's decision
        
        Args:
            player_data: Player information
            game_data: Game state information
            decision: Player's decision text
            context: Decision context
            
        Returns:
            Evaluation results
        """
        try:
            # Create context string
            context_str = "\n".join([f"- {k}: {v}" for k, v in context.items()])
            
            # Run the evaluation chain
            evaluation_text = await asyncio.to_thread(
                self.decision_chain.run,
                player_id=player_data.get("id", "unknown"),
                player_role=player_data.get("role", "unknown"),
                player_karma=player_data.get("karma", 0),
                current_era=game_data.get("current_era", "Initiation"),
                current_turn=game_data.get("current_turn", 1),
                timeline_stability=game_data.get("timeline_stability", 100),
                context=context_str,
                decision=decision
            )
            
            # Parse the evaluation
            try:
                # Extract JSON from the response
                json_start = evaluation_text.find('{')
                json_end = evaluation_text.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    evaluation_json = evaluation_text[json_start:json_end]
                    evaluation = json.loads(evaluation_json)
                else:
                    # Fallback if JSON parsing fails
                    logger.warning("Failed to extract JSON from evaluation text")
                    evaluation = {
                        "ethical_impact": "Unable to determine ethical impact",
                        "technological_impact": "Unable to determine technological impact",
                        "temporal_impact": "Unable to determine temporal impact",
                        "karma_impact": 0,
                        "affected_realms": [],
                        "affected_timelines": [],
                        "explanation": "Unable to evaluate decision"
                    }
            except json.JSONDecodeError:
                logger.error("Failed to parse evaluation JSON")
                evaluation = {
                    "ethical_impact": "Unable to determine ethical impact",
                    "technological_impact": "Unable to determine technological impact",
                    "temporal_impact": "Unable to determine temporal impact",
                    "karma_impact": 0,
                    "affected_realms": [],
                    "affected_timelines": [],
                    "explanation": "Unable to evaluate decision"
                }
            
            # Ensure karma impact is within bounds
            karma_range = self.game_config["karma_range"]
            evaluation["karma_impact"] = max(min(evaluation.get("karma_impact", 0), karma_range[1]), karma_range[0])
            
            # Store decision embedding for future reference
            await self._store_decision_embedding(player_data["id"], decision, context, evaluation)
            
            return evaluation
        except Exception as e:
            logger.error(f"Error evaluating decision: {str(e)}")
            raise
    
    async def _store_decision_embedding(self, 
                                      player_id: str,
                                      decision: str,
                                      context: Dict[str, Any],
                                      evaluation: Dict[str, Any]) -> None:
        """
        Store decision embedding in vector database
        
        Args:
            player_id: Player ID
            decision: Decision text
            context: Decision context
            evaluation: Decision evaluation
        """
        try:
            # Create combined text for embedding
            combined_text = f"Decision: {decision}\nContext: {json.dumps(context)}"
            
            # Create metadata
            metadata = {
                "player_id": player_id,
                "decision": decision,
                "karma_impact": evaluation.get("karma_impact", 0),
                "ethical_impact": evaluation.get("ethical_impact", ""),
                "technological_impact": evaluation.get("technological_impact", ""),
                "temporal_impact": evaluation.get("temporal_impact", ""),
                "timestamp": context.get("timestamp", "")
            }
            
            # Store in vector database
            vector_id = f"decision:{player_id}:{context.get('timestamp', '')}"
            await asyncio.to_thread(
                self.embedding_manager.store_vector,
                vector_id,
                await asyncio.to_thread(self.embedding_manager.create_embedding, combined_text),
                metadata
            )
        except Exception as e:
            logger.error(f"Error storing decision embedding: {str(e)}")
    
    async def find_similar_decisions(self, 
                                   query: str, 
                                   player_id: Optional[str] = None,
                                   top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Find decisions similar to the query
        
        Args:
            query: Query text
            player_id: Optional player ID to filter by
            top_k: Number of results to return
            
        Returns:
            List of similar decisions
        """
        try:
            # Create filter
            filter_dict = {}
            if player_id:
                filter_dict["player_id"] = player_id
            
            # Query vector database
            query_embedding = await asyncio.to_thread(
                self.embedding_manager.create_embedding, 
                query
            )
            
            results = await asyncio.to_thread(
                self.embedding_manager.query_vectors,
                query_embedding,
                top_k,
                filter_dict
            )
            
            return results
        except Exception as e:
            logger.error(f"Error finding similar decisions: {str(e)}")
            return []
