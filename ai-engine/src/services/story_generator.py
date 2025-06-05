"""
Story Generator Service
Generates narrative content for the ChronoCore game using LangChain and OpenAI.
"""

import os
import random
from typing import List, Dict, Optional
import asyncio

from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers import PydanticOutputParser

from ..models.game_state import GameState
from ..models.player import Player
from ..models.quest import Quest, QuestOption, QuestOutcome
from ..utils.config import Config


class StoryGenerator:
    """
    Service for generating narrative content for the ChronoCore game.
    Uses LangChain and OpenAI to create dynamic, contextually relevant stories.
    """
    
    def __init__(self):
        """Initialize the story generator with LangChain components."""
        # Initialize OpenAI Chat model
        self.llm = ChatOpenAI(
            temperature=Config.OPENAI_TEMPERATURE,
            max_tokens=Config.OPENAI_MAX_TOKENS,
            model_name=Config.OPENAI_MODEL,
            openai_api_key=Config.OPENAI_API_KEY
        )
        
        # Initialize prompt templates
        self.story_prompt = PromptTemplate(
            input_variables=["game_state", "current_era", "recent_events"],
            template="""
            You are the AI storyteller for ChronoCore: Path of Realities, a board game about time, ethics, and technology.
            
            Current Game State:
            {game_state}
            
            Current Era: {current_era}
            
            Recent Events:
            {recent_events}
            
            Based on this information, generate a compelling narrative paragraph that describes the current state of the game world.
            Focus on the consequences of player actions, the state of different timelines, and the ethical implications of recent events.
            The tone should be philosophical and thought-provoking, with elements of both hope and concern for the future.
            """
        )
        
        self.quest_prompt = PromptTemplate(
            input_variables=["player", "player_role", "karma", "owned_realms", "timeline", "game_state"],
            template="""
            You are creating a quest for a player in ChronoCore: Path of Realities, a board game about time, ethics, and technology.
            
            Player Information:
            - Name: {player}
            - Role: {player_role}
            - Karma: {karma}
            - Owned Realms: {owned_realms}
            
            Timeline Context:
            {timeline}
            
            Game State:
            {game_state}
            
            Create a quest with the following elements:
            1. A title that captures the essence of the quest
            2. A description that sets up an ethical dilemma or technological challenge
            3. 3-4 options for resolving the quest, each with different ethical implications
            4. Each option should have a karma impact (positive or negative)
            5. The quest should be appropriate for the player's role and current game state
            
            Format your response as a structured quest with clear sections for title, description, and options.
            """
        )
        
        self.ethical_dilemma_prompt = PromptTemplate(
            input_variables=["realm", "timeline", "tech_level"],
            template="""
            You are creating an ethical dilemma for a realm in ChronoCore: Path of Realities.
            
            Realm Information:
            {realm}
            
            Timeline Context:
            {timeline}
            
            Technology Level: {tech_level}
            
            Create an ethical dilemma with the following elements:
            1. A title that captures the essence of the dilemma
            2. A description that presents a complex ethical situation related to technology, society, or environment
            3. 3 options for resolving the dilemma, each with different ethical implications
            4. Each option should have a karma impact (positive or negative)
            5. The dilemma should be appropriate for the realm's context and technology level
            
            Format your response as a structured dilemma with clear sections for title, description, and options.
            """
        )
        
        # Initialize LLM chains
        self.story_chain = LLMChain(llm=self.llm, prompt=self.story_prompt)
        self.quest_chain = LLMChain(llm=self.llm, prompt=self.quest_prompt)
        self.ethical_dilemma_chain = LLMChain(llm=self.llm, prompt=self.ethical_dilemma_prompt)
    
    async def generate(self, game_state: GameState) -> str:
        """
        Generate a narrative description of the current game state.
        
        Args:
            game_state: The current state of the game
            
        Returns:
            A narrative description of the game world
        """
        # Extract recent events from game state
        recent_events = game_state.events_history[-5:] if game_state.events_history else []
        recent_events_text = "\n".join([f"- {event['description']}" for event in recent_events])
        
        # Generate story
        result = await asyncio.to_thread(
            self.story_chain.run,
            game_state=game_state.json(),
            current_era=game_state.current_era,
            recent_events=recent_events_text
        )
        
        return result
    
    async def generate_quest(self, player: Player, game_state: GameState) -> Quest:
        """
        Generate a quest for a specific player based on their actions and game state.
        
        Args:
            player: The player to generate a quest for
            game_state: The current state of the game
            
        Returns:
            A new quest object
        """
        # Get player's owned realms
        owned_realms = []
        for realm_id in player.owned_realms:
            for realm in game_state.realms:
                if realm.realm_id == realm_id:
                    owned_realms.append(realm.name)
        
        # Get a relevant timeline
        timeline = None
        if game_state.timelines:
            # Prioritize timelines connected to player's realms
            for t in game_state.timelines:
                if any(realm_id in player.owned_realms for realm_id in t.realms):
                    timeline = t
                    break
            
            # If no connected timeline found, pick a random one
            if timeline is None:
                timeline = random.choice(game_state.timelines)
        
        # Generate quest text
        quest_text = await asyncio.to_thread(
            self.quest_chain.run,
            player=player.username,
            player_role=player.role,
            karma=player.karma,
            owned_realms=", ".join(owned_realms) if owned_realms else "None",
            timeline=timeline.json() if timeline else "No timeline context available",
            game_state=game_state.json()
        )
        
        # Parse the generated text into a structured quest
        # This is a simplified version - in a real implementation, you would use a more robust parser
        lines = quest_text.strip().split("\n")
        title = lines[0].strip()
        
        description = ""
        options = []
        current_section = "description"
        
        for line in lines[1:]:
            line = line.strip()
            if not line:
                continue
            
            if line.lower().startswith("option ") or line.lower().startswith("- option "):
                current_section = "options"
                option_text = line.split(":", 1)[1].strip() if ":" in line else line
                karma_impact = 0
                
                # Extract karma impact if mentioned
                if "karma" in option_text.lower():
                    try:
                        karma_text = option_text.lower().split("karma", 1)[1].strip()
                        if "+" in karma_text:
                            karma_impact = int(karma_text.split("+")[1].split()[0])
                        elif "-" in karma_text:
                            karma_impact = -int(karma_text.split("-")[1].split()[0])
                    except:
                        pass
                
                options.append(QuestOption(
                    option_id=f"option_{len(options) + 1}",
                    description=option_text,
                    karma_impact=karma_impact,
                    tech_impact=0,
                    timeline_impact={},
                    realm_impact={}
                ))
            elif current_section == "description":
                description += line + " "
        
        # Create and return the quest object
        quest = Quest(
            quest_id=f"quest_{random.randint(1000, 9999)}",
            title=title,
            description=description.strip(),
            type=self._determine_quest_type(description),
            difficulty=random.randint(1, 5),
            player_id=player.player_id,
            timeline_id=timeline.timeline_id if timeline else None,
            realm_id=random.choice(player.owned_realms) if player.owned_realms else None,
            options=options,
            requirements={},
            status="active",
            expiration_turn=game_state.current_turn + 5  # Quest expires after 5 turns
        )
        
        return quest
    
    async def generate_ethical_dilemma(self, realm_id: str, game_state: GameState) -> Dict:
        """
        Generate an ethical dilemma for a specific realm.
        
        Args:
            realm_id: The ID of the realm to generate a dilemma for
            game_state: The current state of the game
            
        Returns:
            A dictionary representing an ethical dilemma
        """
        # Find the realm
        realm = None
        for r in game_state.realms:
            if r.realm_id == realm_id:
                realm = r
                break
        
        if realm is None:
            raise ValueError(f"Realm with ID {realm_id} not found")
        
        # Find the timeline for this realm
        timeline = None
        for t in game_state.timelines:
            if realm_id in t.realms:
                timeline = t
                break
        
        # Generate dilemma text
        dilemma_text = await asyncio.to_thread(
            self.ethical_dilemma_chain.run,
            realm=realm.json(),
            timeline=timeline.json() if timeline else "No timeline context available",
            tech_level=realm.development_level
        )
        
        # Parse the generated text into a structured dilemma
        # This is a simplified version - in a real implementation, you would use a more robust parser
        lines = dilemma_text.strip().split("\n")
        title = lines[0].strip()
        
        description = ""
        options = []
        current_section = "description"
        
        for line in lines[1:]:
            line = line.strip()
            if not line:
                continue
            
            if line.lower().startswith("option ") or line.lower().startswith("- option "):
                current_section = "options"
                option_text = line.split(":", 1)[1].strip() if ":" in line else line
                karma_impact = 0
                
                # Extract karma impact if mentioned
                if "karma" in option_text.lower():
                    try:
                        karma_text = option_text.lower().split("karma", 1)[1].strip()
                        if "+" in karma_text:
                            karma_impact = int(karma_text.split("+")[1].split()[0])
                        elif "-" in karma_text:
                            karma_impact = -int(karma_text.split("-")[1].split()[0])
                    except:
                        pass
                
                options.append({
                    "description": option_text,
                    "karma_impact": karma_impact
                })
            elif current_section == "description":
                description += line + " "
        
        # Create and return the dilemma
        dilemma = {
            "title": title,
            "description": description.strip(),
            "options": options,
            "resolved": False,
            "created_at": None  # Will be set when added to the realm
        }
        
        return dilemma
    
    def _determine_quest_type(self, description: str) -> str:
        """
        Determine the type of quest based on its description.
        
        Args:
            description: The quest description
            
        Returns:
            The quest type (Ethical, Technical, Diplomatic, etc.)
        """
        description_lower = description.lower()
        
        if any(word in description_lower for word in ["ethic", "moral", "right", "wrong", "justice"]):
            return "Ethical"
        elif any(word in description_lower for word in ["tech", "science", "research", "develop"]):
            return "Technical"
        elif any(word in description_lower for word in ["diplomat", "negotiate", "alliance", "peace"]):
            return "Diplomatic"
        elif any(word in description_lower for word in ["time", "chrono", "paradox", "rift"]):
            return "Temporal"
        else:
            return "General"
