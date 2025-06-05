"""
Game Data
Manages game-specific data and provides utilities for game state management.
"""

import os
import json
import logging
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime

from ..utils.database import (
    save_game_state, get_game_state,
    save_player, get_player,
    save_quest, get_quest,
    get_player_quests, save_decision,
    get_player_decisions
)
from ..models.game_state import GameState
from ..models.player import Player
from ..models.quest import Quest
from ..models.timeline import Timeline
from ..models.realm import Realm

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GameData:
    """
    Manages game data for the ChronoCore AI engine.
    Provides methods for loading, saving, and manipulating game state.
    """
    
    def __init__(self):
        """Initialize the game data manager."""
        self.cache = {
            "game_states": {},
            "players": {},
            "quests": {},
            "decisions": {}
        }
    
    async def get_game(self, game_id: str) -> Optional[GameState]:
        """
        Get a game state by ID.
        
        Args:
            game_id: ID of the game to retrieve
            
        Returns:
            GameState object or None if not found
        """
        # Check cache first
        if game_id in self.cache["game_states"]:
            return self.cache["game_states"][game_id]
        
        # Get from database
        game_data = await get_game_state(game_id)
        
        if not game_data:
            logger.warning(f"Game not found: {game_id}")
            return None
        
        try:
            # Convert to GameState object
            game_state = GameState(**game_data)
            
            # Cache for future use
            self.cache["game_states"][game_id] = game_state
            
            return game_state
            
        except Exception as e:
            logger.error(f"Error converting game data to GameState: {e}")
            return None
    
    async def save_game(self, game_state: GameState) -> bool:
        """
        Save a game state.
        
        Args:
            game_state: GameState object to save
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Convert to dictionary
            game_data = game_state.dict()
            
            # Update cache
            self.cache["game_states"][game_state.game_id] = game_state
            
            # Save to database
            success = await save_game_state(game_data)
            
            return success
            
        except Exception as e:
            logger.error(f"Error saving game state: {e}")
            return False
    
    async def get_player(self, player_id: str) -> Optional[Player]:
        """
        Get a player by ID.
        
        Args:
            player_id: ID of the player to retrieve
            
        Returns:
            Player object or None if not found
        """
        # Check cache first
        if player_id in self.cache["players"]:
            return self.cache["players"][player_id]
        
        # Get from database
        player_data = await get_player(player_id)
        
        if not player_data:
            logger.warning(f"Player not found: {player_id}")
            return None
        
        try:
            # Convert to Player object
            player = Player(**player_data)
            
            # Cache for future use
            self.cache["players"][player_id] = player
            
            return player
            
        except Exception as e:
            logger.error(f"Error converting player data to Player: {e}")
            return None
    
    async def save_player(self, player: Player) -> bool:
        """
        Save a player.
        
        Args:
            player: Player object to save
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Convert to dictionary
            player_data = player.dict()
            
            # Update cache
            self.cache["players"][player.player_id] = player
            
            # Save to database
            success = await save_player(player_data)
            
            return success
            
        except Exception as e:
            logger.error(f"Error saving player: {e}")
            return False
    
    async def get_quest(self, quest_id: str) -> Optional[Quest]:
        """
        Get a quest by ID.
        
        Args:
            quest_id: ID of the quest to retrieve
            
        Returns:
            Quest object or None if not found
        """
        # Check cache first
        if quest_id in self.cache["quests"]:
            return self.cache["quests"][quest_id]
        
        # Get from database
        quest_data = await get_quest(quest_id)
        
        if not quest_data:
            logger.warning(f"Quest not found: {quest_id}")
            return None
        
        try:
            # Convert to Quest object
            quest = Quest(**quest_data)
            
            # Cache for future use
            self.cache["quests"][quest_id] = quest
            
            return quest
            
        except Exception as e:
            logger.error(f"Error converting quest data to Quest: {e}")
            return None
    
    async def save_quest(self, quest: Quest) -> bool:
        """
        Save a quest.
        
        Args:
            quest: Quest object to save
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Convert to dictionary
            quest_data = quest.dict()
            
            # Update cache
            self.cache["quests"][quest.quest_id] = quest
            
            # Save to database
            success = await save_quest(quest_data)
            
            return success
            
        except Exception as e:
            logger.error(f"Error saving quest: {e}")
            return False
    
    async def get_player_quests(self, player_id: str) -> List[Quest]:
        """
        Get all quests for a player.
        
        Args:
            player_id: ID of the player
            
        Returns:
            List of Quest objects
        """
        # Get from database
        quest_data_list = await get_player_quests(player_id)
        
        quests = []
        
        for quest_data in quest_data_list:
            try:
                quest = Quest(**quest_data)
                
                # Cache for future use
                self.cache["quests"][quest.quest_id] = quest
                
                quests.append(quest)
                
            except Exception as e:
                logger.error(f"Error converting quest data to Quest: {e}")
        
        return quests
    
    async def save_player_decision(self, player_id: str, decision: Dict) -> bool:
        """
        Save a player's decision.
        
        Args:
            player_id: ID of the player
            decision: Decision data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Add player ID if not present
            if "player_id" not in decision:
                decision["player_id"] = player_id
            
            # Add timestamp if not present
            if "timestamp" not in decision:
                decision["timestamp"] = datetime.now().isoformat()
            
            # Save to database
            success = await save_decision(decision)
            
            return success
            
        except Exception as e:
            logger.error(f"Error saving player decision: {e}")
            return False
    
    async def get_player_decisions(self, player_id: str, limit: int = 10) -> List[Dict]:
        """
        Get recent decisions for a player.
        
        Args:
            player_id: ID of the player
            limit: Maximum number of decisions to retrieve
            
        Returns:
            List of decision dictionaries
        """
        # Get from database
        decisions = await get_player_decisions(player_id, limit)
        
        return decisions
    
    async def create_new_game(self, players: List[Dict], settings: Dict = None) -> Optional[GameState]:
        """
        Create a new game with the specified players and settings.
        
        Args:
            players: List of player data dictionaries
            settings: Optional game settings
            
        Returns:
            New GameState object or None if creation failed
        """
        try:
            # Generate a unique game ID
            game_id = f"game_{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(players)}"
            
            # Create player objects
            player_objects = []
            for player_data in players:
                player = Player(**player_data)
                player_objects.append(player)
                
                # Save player to database
                await self.save_player(player)
            
            # Create initial timelines
            timelines = [
                Timeline(
                    timeline_id=f"timeline_{i}",
                    name=f"Timeline {chr(65+i)}",
                    stability=100,
                    description=f"A stable timeline with balanced technological and ethical development.",
                    realms=[],
                    events=[]
                )
                for i in range(3)  # Start with 3 timelines
            ]
            
            # Create initial realms
            realms = [
                Realm(
                    realm_id=f"realm_{i}",
                    name=f"Realm {i+1}",
                    owner_id=None,  # Initially unowned
                    timeline_id=f"timeline_{i//3}",  # Distribute across timelines
                    development_level=1,
                    technology_focus="Balanced",
                    ethical_alignment=0,
                    resources=50,
                    population=1000000,
                    description=f"A developing realm with moderate resources and a growing population."
                )
                for i in range(9)  # Start with 9 realms
            ]
            
            # Add realm IDs to timelines
            for realm in realms:
                timeline_id = realm.timeline_id
                for timeline in timelines:
                    if timeline.timeline_id == timeline_id:
                        timeline.realms.append(realm.realm_id)
            
            # Create game state
            game_state = GameState(
                game_id=game_id,
                players=player_objects,
                timelines=timelines,
                realms=realms,
                current_era="Initiation",
                current_turn=0,
                current_player_index=0,
                events_history=[],
                global_karma=0,
                time_rifts=[],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Apply custom settings if provided
            if settings:
                for key, value in settings.items():
                    if hasattr(game_state, key):
                        setattr(game_state, key, value)
            
            # Save game state
            success = await self.save_game(game_state)
            
            if success:
                return game_state
            else:
                logger.error(f"Failed to save new game state")
                return None
                
        except Exception as e:
            logger.error(f"Error creating new game: {e}")
            return None
    
    def clear_cache(self) -> None:
        """Clear the cache."""
        self.cache = {
            "game_states": {},
            "players": {},
            "quests": {},
            "decisions": {}
        }
        logger.info("Cache cleared")
