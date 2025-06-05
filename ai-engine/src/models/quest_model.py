"""
Quest Model
Handles generation of quests and their outcomes for players
"""

import json
import asyncio
from typing import Dict, Any, List, Optional
import logging
import uuid
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
from ..data.training.decision_prompts import get_quest_generation_prompt
from ..utils.config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuestModel:
    """Model for generating player quests"""
    
    def __init__(self):
        """Initialize the quest model"""
        # Load configuration
        self.config = Config.get_openai_config()
        self.game_config = Config.get_game_config()
        
        # Initialize OpenAI LLM
        self.llm = ChatOpenAI(
            model_name=self.config["model"],
            temperature=self.config["temperature"],
            openai_api_key=self.config["api_key"]
        )
        
        # Create quest generation chain
        self.quest_template = PromptTemplate(
            input_variables=["player_id", "player_role", "player_karma", 
                           "player_realms", "current_era", "current_turn", 
                           "timeline_stability", "recent_events"],
            template=get_quest_generation_prompt({}, {})
        )
        
        self.quest_chain = LLMChain(
            llm=self.llm,
            prompt=self.quest_template,
            verbose=True
        )
        
        logger.info("Quest model initialized")
    
    async def generate_quest(self, 
                           player_data: Dict[str, Any], 
                           game_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a quest for a player
        
        Args:
            player_data: Player information
            game_data: Game state information
            
        Returns:
            Generated quest
        """
        try:
            # Format player realms
            player_realms = ", ".join([r.get("name", "Unknown Realm") for r in player_data.get("realms", [])])
            
            # Format recent events
            recent_events = "\n".join([f"- {e.get('description', '')}" for e in game_data.get("recent_events", [])])
            
            # Run the quest generation chain
            quest_text = await asyncio.to_thread(
                self.quest_chain.run,
                player_id=player_data.get("id", "unknown"),
                player_role=player_data.get("role", "unknown"),
                player_karma=player_data.get("karma", 0),
                player_realms=player_realms or "None",
                current_era=game_data.get("current_era", "Initiation"),
                current_turn=game_data.get("current_turn", 1),
                timeline_stability=game_data.get("timeline_stability", 100),
                recent_events=recent_events or "No recent events"
            )
            
            # Parse the quest
            try:
                # Extract JSON from the response
                json_start = quest_text.find('{')
                json_end = quest_text.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    quest_json = quest_text[json_start:json_end]
                    quest = json.loads(quest_json)
                else:
                    # Fallback if JSON parsing fails
                    logger.warning("Failed to extract JSON from quest text")
                    quest = self._create_fallback_quest(player_data)
            except json.JSONDecodeError:
                logger.error("Failed to parse quest JSON")
                quest = self._create_fallback_quest(player_data)
            
            # Add quest ID and metadata
            quest["id"] = str(uuid.uuid4())
            quest["player_id"] = player_data.get("id", "unknown")
            quest["created_at"] = game_data.get("current_turn", 1)
            quest["era"] = game_data.get("current_era", "Initiation")
            
            # Ensure quest has all required fields
            self._validate_quest(quest)
            
            return quest
        except Exception as e:
            logger.error(f"Error generating quest: {str(e)}")
            return self._create_fallback_quest(player_data)
    
    def _create_fallback_quest(self, player_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a fallback quest when generation fails
        
        Args:
            player_data: Player information
            
        Returns:
            Fallback quest
        """
        role = player_data.get("role", "Architect")
        
        # Create quest based on player role
        if role == "Techno Monk":
            title = "Balance of Innovation"
            description = "A realm's technological advancement has created unforeseen consequences. You must decide how to guide their development while maintaining ethical balance."
            quest_type = "Ethical"
        elif role == "Shadow Broker":
            title = "Hidden Knowledge"
            description = "You've discovered information that could destabilize a timeline. Determine how to use this knowledge for your advantage without causing a temporal collapse."
            quest_type = "Diplomatic"
        elif role == "Chrono Diplomat":
            title = "Timeline Negotiation"
            description = "Two realms are on the brink of conflict that could create a time rift. Negotiate a resolution that preserves timeline stability."
            quest_type = "Diplomatic"
        elif role == "Bio-Smith":
            title = "Ecological Crisis"
            description = "A realm faces an ecological disaster that threatens their existence. Develop a solution that balances immediate needs with long-term sustainability."
            quest_type = "Technical"
        else:
            title = "Temporal Anomaly"
            description = "A mysterious anomaly has appeared in a nearby realm. Investigate its cause and determine how to address it."
            quest_type = "Temporal"
        
        # Create options
        options = [
            {
                "id": 1,
                "text": "Take direct action to resolve the issue immediately.",
                "potential_outcome": "Quick resolution but potential unforeseen consequences."
            },
            {
                "id": 2,
                "text": "Gather more information before deciding on a course of action.",
                "potential_outcome": "Better understanding but the situation may worsen while you investigate."
            },
            {
                "id": 3,
                "text": "Collaborate with other players to find a solution.",
                "potential_outcome": "Combined resources but shared responsibility for outcomes."
            }
        ]
        
        return {
            "id": str(uuid.uuid4()),
            "title": title,
            "description": description,
            "type": quest_type,
            "difficulty": 2,
            "options": options,
            "player_id": player_data.get("id", "unknown"),
            "created_at": 1,
            "era": "Initiation"
        }
    
    def _validate_quest(self, quest: Dict[str, Any]) -> None:
        """
        Validate and fix quest structure
        
        Args:
            quest: Quest to validate
        """
        # Ensure required fields exist
        required_fields = ["title", "description", "type", "difficulty", "options"]
        for field in required_fields:
            if field not in quest:
                if field == "title":
                    quest["title"] = "Mysterious Quest"
                elif field == "description":
                    quest["description"] = "A mysterious challenge awaits you."
                elif field == "type":
                    quest["type"] = "General"
                elif field == "difficulty":
                    quest["difficulty"] = 2
                elif field == "options":
                    quest["options"] = [
                        {
                            "id": 1,
                            "text": "Accept the challenge",
                            "potential_outcome": "Unknown consequences await"
                        },
                        {
                            "id": 2,
                            "text": "Decline the challenge",
                            "potential_outcome": "Opportunity lost, but safety preserved"
                        }
                    ]
        
        # Validate quest type
        valid_types = ["Ethical", "Technical", "Diplomatic", "Temporal", "General"]
        if quest["type"] not in valid_types:
            quest["type"] = "General"
        
        # Validate difficulty
        if not isinstance(quest["difficulty"], int) or quest["difficulty"] < 1 or quest["difficulty"] > 5:
            quest["difficulty"] = 2
        
        # Validate options
        if not isinstance(quest["options"], list) or len(quest["options"]) == 0:
            quest["options"] = [
                {
                    "id": 1,
                    "text": "Accept the challenge",
                    "potential_outcome": "Unknown consequences await"
                },
                {
                    "id": 2,
                    "text": "Decline the challenge",
                    "potential_outcome": "Opportunity lost, but safety preserved"
                }
            ]
        
        # Ensure each option has required fields
        for i, option in enumerate(quest["options"]):
            if not isinstance(option, dict):
                quest["options"][i] = {
                    "id": i + 1,
                    "text": "Take action",
                    "potential_outcome": "Unknown consequences"
                }
                continue
            
            if "id" not in option:
                option["id"] = i + 1
            
            if "text" not in option:
                option["text"] = f"Option {i + 1}"
            
            if "potential_outcome" not in option:
                option["potential_outcome"] = "Unknown consequences"
    
    async def evaluate_quest_outcome(self, 
                                   quest: Dict[str, Any], 
                                   selected_option_id: int,
                                   player_data: Dict[str, Any],
                                   game_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate the outcome of a quest based on the selected option
        
        Args:
            quest: Quest data
            selected_option_id: ID of the selected option
            player_data: Player information
            game_data: Game state information
            
        Returns:
            Quest outcome
        """
        try:
            # Find the selected option
            selected_option = None
            for option in quest.get("options", []):
                if option.get("id") == selected_option_id:
                    selected_option = option
                    break
            
            if not selected_option:
                logger.warning(f"Selected option {selected_option_id} not found in quest {quest.get('id')}")
                # Use the first option as fallback
                selected_option = quest.get("options", [{}])[0]
            
            # Create prompt for outcome evaluation
            prompt = f"""
            You are the AI engine for ChronoCore: Path of Realities, a game about time manipulation and ethical choices.
            Your task is to evaluate the outcome of a player's quest choice.

            ## Player Information
            - Player ID: {player_data.get('id', 'unknown')}
            - Player Role: {player_data.get('role', 'unknown')}
            - Current Karma: {player_data.get('karma', 0)}

            ## Game Context
            - Current Era: {game_data.get('current_era', 'Initiation')}
            - Current Turn: {game_data.get('current_turn', 1)}

            ## Quest Information
            - Title: {quest.get('title', 'Unknown Quest')}
            - Description: {quest.get('description', 'No description')}
            - Type: {quest.get('type', 'General')}
            - Difficulty: {quest.get('difficulty', 2)}

            ## Selected Option
            {selected_option.get('text', 'Unknown option')}

            ## Evaluation Instructions
            1. Generate a detailed outcome based on the player's choice
            2. Determine the karma impact of this choice (between -10 and +10)
            3. Describe any effects on realms, timelines, or other players
            4. Assign rewards or consequences based on the choice

            ## Response Format
            Provide your evaluation in the following JSON format:
            ```
            {{
              "outcome_description": "Detailed description of what happens as a result of this choice",
              "karma_impact": integer_between_minus_10_and_plus_10,
              "realm_effects": "Description of how realms are affected",
              "timeline_effects": "Description of how timelines are affected",
              "rewards": ["list", "of", "rewards"],
              "consequences": ["list", "of", "consequences"]
            }}
            ```

            Make the outcome engaging, fair, and consistent with the game world.
            """
            
            # Run the evaluation
            outcome_text = await asyncio.to_thread(
                self.llm.predict,
                prompt
            )
            
            # Parse the outcome
            try:
                # Extract JSON from the response
                json_start = outcome_text.find('{')
                json_end = outcome_text.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    outcome_json = outcome_text[json_start:json_end]
                    outcome = json.loads(outcome_json)
                else:
                    # Fallback if JSON parsing fails
                    logger.warning("Failed to extract JSON from outcome text")
                    outcome = self._create_fallback_outcome(quest, selected_option)
            except json.JSONDecodeError:
                logger.error("Failed to parse outcome JSON")
                outcome = self._create_fallback_outcome(quest, selected_option)
            
            # Ensure karma impact is within bounds
            karma_range = self.game_config["karma_range"]
            outcome["karma_impact"] = max(min(outcome.get("karma_impact", 0), karma_range[1]), karma_range[0])
            
            # Add metadata
            outcome["quest_id"] = quest.get("id")
            outcome["selected_option_id"] = selected_option_id
            outcome["player_id"] = player_data.get("id", "unknown")
            outcome["completed_at"] = game_data.get("current_turn", 1)
            
            return outcome
        except Exception as e:
            logger.error(f"Error evaluating quest outcome: {str(e)}")
            return self._create_fallback_outcome(quest, selected_option)
    
    def _create_fallback_outcome(self, quest: Dict[str, Any], selected_option: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a fallback outcome when evaluation fails
        
        Args:
            quest: Quest data
            selected_option: Selected option
            
        Returns:
            Fallback outcome
        """
        option_text = selected_option.get("text", "your choice")
        
        return {
            "outcome_description": f"You completed the quest '{quest.get('title', 'Unknown Quest')}' by choosing to {option_text}. The consequences of your actions will unfold over time.",
            "karma_impact": 0,
            "realm_effects": "The realms continue on their current trajectory.",
            "timeline_effects": "No significant changes to timeline stability detected.",
            "rewards": ["Experience gained from completing the quest"],
            "consequences": ["Your decision will influence future events in ways yet to be seen"]
        }
