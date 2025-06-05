"""
Game State Model
Represents the current state of a game session.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from .player import Player
from .timeline import Timeline
from .realm import Realm


class GameState(BaseModel):
    """
    Represents the complete state of a ChronoCore game session.
    """
    game_id: str = Field(..., description="Unique identifier for the game session")
    players: List[Player] = Field(default_factory=list, description="List of players in the game")
    timelines: List[Timeline] = Field(default_factory=list, description="List of active timelines in the game")
    realms: List[Realm] = Field(default_factory=list, description="List of realms on the board")
    current_era: str = Field(..., description="Current era of the game (Initiation, Progression, Distortion, Equilibrium)")
    current_turn: int = Field(0, description="Current turn number")
    current_player_index: int = Field(0, description="Index of the current player in the players list")
    events_history: List[Dict] = Field(default_factory=list, description="History of events that have occurred in the game")
    global_karma: int = Field(0, description="Global karma value affecting all players")
    time_rifts: List[Dict] = Field(default_factory=list, description="Active time rifts on the board")
    created_at: datetime = Field(default_factory=datetime.now, description="When the game was created")
    updated_at: datetime = Field(default_factory=datetime.now, description="When the game state was last updated")
    
    def get_current_player(self) -> Optional[Player]:
        """Get the player whose turn it currently is."""
        if 0 <= self.current_player_index < len(self.players):
            return self.players[self.current_player_index]
        return None
    
    def advance_turn(self) -> None:
        """Advance to the next player's turn."""
        self.current_turn += 1
        self.current_player_index = (self.current_player_index + 1) % len(self.players)
        self.updated_at = datetime.now()
    
    def add_event(self, event_type: str, description: str, affected_players: List[str], 
                  affected_realms: List[str], karma_impact: int) -> None:
        """Add a new event to the game's history."""
        self.events_history.append({
            "event_type": event_type,
            "description": description,
            "affected_players": affected_players,
            "affected_realms": affected_realms,
            "karma_impact": karma_impact,
            "turn": self.current_turn,
            "timestamp": datetime.now()
        })
        self.updated_at = datetime.now()
    
    def create_time_rift(self, location: Dict, severity: int, description: str) -> None:
        """Create a new time rift on the board."""
        self.time_rifts.append({
            "location": location,
            "severity": severity,
            "description": description,
            "created_at_turn": self.current_turn,
            "resolved": False
        })
        self.updated_at = datetime.now()
    
    def resolve_time_rift(self, rift_index: int) -> None:
        """Mark a time rift as resolved."""
        if 0 <= rift_index < len(self.time_rifts):
            self.time_rifts[rift_index]["resolved"] = True
            self.time_rifts[rift_index]["resolved_at_turn"] = self.current_turn
            self.updated_at = datetime.now()
