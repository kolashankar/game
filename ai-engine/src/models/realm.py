"""
Realm Model
Represents a realm (hexagonal tile) in the ChronoCore game.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class Realm(BaseModel):
    """
    Represents a realm (hexagonal tile) in the ChronoCore game.
    Realms are the basic units of the game board.
    """
    realm_id: str = Field(..., description="Unique identifier for the realm")
    name: str = Field(..., description="Name of the realm")
    description: str = Field(..., description="Description of the realm")
    type: str = Field(..., description="Type of realm (e.g., Urban, Natural, Technological)")
    timeline_id: str = Field(..., description="ID of the timeline this realm belongs to")
    position: Dict = Field(..., description="Position of the realm on the board (x, y coordinates)")
    owner_id: Optional[str] = Field(None, description="ID of the player who owns this realm")
    development_level: int = Field(1, description="Development level of the realm (1-5)")
    resources: Dict = Field(default_factory=dict, description="Resources available in this realm")
    structures: List[Dict] = Field(default_factory=list, description="Structures built in this realm")
    events: List[Dict] = Field(default_factory=list, description="Events that have occurred in this realm")
    ethical_dilemmas: List[Dict] = Field(default_factory=list, description="Ethical dilemmas associated with this realm")
    adjacent_realms: List[str] = Field(default_factory=list, description="IDs of realms adjacent to this one")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    def set_owner(self, player_id: Optional[str]) -> None:
        """Set the owner of this realm."""
        self.owner_id = player_id
        self.updated_at = datetime.now()
    
    def add_structure(self, structure_type: str, name: str, effects: Dict) -> None:
        """Add a new structure to the realm."""
        structure = {
            "type": structure_type,
            "name": name,
            "effects": effects,
            "built_at": datetime.now()
        }
        self.structures.append(structure)
        self.updated_at = datetime.now()
    
    def remove_structure(self, structure_index: int) -> None:
        """Remove a structure from the realm."""
        if 0 <= structure_index < len(self.structures):
            self.structures.pop(structure_index)
            self.updated_at = datetime.now()
    
    def add_event(self, event_type: str, description: str, impact: Dict) -> None:
        """Add a new event to the realm's history."""
        self.events.append({
            "event_type": event_type,
            "description": description,
            "impact": impact,
            "timestamp": datetime.now()
        })
        self.updated_at = datetime.now()
    
    def add_ethical_dilemma(self, title: str, description: str, options: List[Dict]) -> None:
        """Add a new ethical dilemma to the realm."""
        dilemma = {
            "title": title,
            "description": description,
            "options": options,
            "resolved": False,
            "created_at": datetime.now()
        }
        self.ethical_dilemmas.append(dilemma)
        self.updated_at = datetime.now()
    
    def resolve_ethical_dilemma(self, dilemma_index: int, chosen_option_index: int, 
                                player_id: str, outcome: str) -> None:
        """Resolve an ethical dilemma in the realm."""
        if 0 <= dilemma_index < len(self.ethical_dilemmas):
            dilemma = self.ethical_dilemmas[dilemma_index]
            dilemma["resolved"] = True
            dilemma["resolved_by"] = player_id
            dilemma["chosen_option"] = chosen_option_index
            dilemma["outcome"] = outcome
            dilemma["resolved_at"] = datetime.now()
            self.updated_at = datetime.now()
    
    def increase_development(self) -> bool:
        """
        Increase the development level of the realm.
        Returns True if successful, False if already at max level.
        """
        if self.development_level < 5:
            self.development_level += 1
            self.updated_at = datetime.now()
            return True
        return False
    
    def add_adjacent_realm(self, realm_id: str) -> None:
        """Add an adjacent realm to this realm."""
        if realm_id not in self.adjacent_realms:
            self.adjacent_realms.append(realm_id)
            self.updated_at = datetime.now()
