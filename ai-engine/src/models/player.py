"""
Player Model
Represents a player in the ChronoCore game.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class TechTree(BaseModel):
    """Represents a player's technology development tree."""
    unlocked_technologies: List[str] = Field(default_factory=list)
    current_research: Optional[str] = None
    research_progress: int = Field(0, description="Progress towards current research (0-100)")
    tech_level: int = Field(1, description="Overall technology level")


class Player(BaseModel):
    """
    Represents a player in the ChronoCore game.
    """
    player_id: str = Field(..., description="Unique identifier for the player")
    user_id: str = Field(..., description="ID of the user account associated with this player")
    username: str = Field(..., description="Display name of the player")
    role: str = Field(..., description="Player role (Techno Monk, Shadow Broker, Chrono Diplomat, Bio-Smith)")
    karma: int = Field(0, description="Player's karma score")
    tech_tree: TechTree = Field(default_factory=TechTree)
    owned_realms: List[str] = Field(default_factory=list, description="IDs of realms owned by this player")
    timeline_connections: List[Dict] = Field(default_factory=list, description="Connections between timelines established by this player")
    inventory: Dict = Field(default_factory=dict, description="Items and resources held by the player")
    abilities: List[Dict] = Field(default_factory=list, description="Special abilities available to the player")
    quest_history: List[Dict] = Field(default_factory=list, description="History of quests completed by the player")
    decision_history: List[Dict] = Field(default_factory=list, description="History of significant decisions made by the player")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    def add_karma(self, amount: int, reason: str) -> None:
        """Add or subtract karma from the player."""
        self.karma += amount
        self.decision_history.append({
            "type": "karma_change",
            "amount": amount,
            "reason": reason,
            "timestamp": datetime.now()
        })
        self.updated_at = datetime.now()
    
    def add_realm(self, realm_id: str) -> None:
        """Add a realm to the player's owned realms."""
        if realm_id not in self.owned_realms:
            self.owned_realms.append(realm_id)
            self.updated_at = datetime.now()
    
    def remove_realm(self, realm_id: str) -> None:
        """Remove a realm from the player's owned realms."""
        if realm_id in self.owned_realms:
            self.owned_realms.remove(realm_id)
            self.updated_at = datetime.now()
    
    def add_timeline_connection(self, from_timeline: str, to_timeline: str) -> None:
        """Add a connection between timelines established by this player."""
        connection = {
            "from_timeline": from_timeline,
            "to_timeline": to_timeline,
            "established_at": datetime.now()
        }
        self.timeline_connections.append(connection)
        self.updated_at = datetime.now()
    
    def unlock_technology(self, tech_id: str) -> None:
        """Unlock a new technology in the player's tech tree."""
        if tech_id not in self.tech_tree.unlocked_technologies:
            self.tech_tree.unlocked_technologies.append(tech_id)
            self.updated_at = datetime.now()
    
    def start_research(self, tech_id: str) -> None:
        """Start researching a new technology."""
        self.tech_tree.current_research = tech_id
        self.tech_tree.research_progress = 0
        self.updated_at = datetime.now()
    
    def add_research_progress(self, amount: int) -> bool:
        """
        Add progress to the current research.
        Returns True if research is completed.
        """
        if self.tech_tree.current_research is None:
            return False
        
        self.tech_tree.research_progress += amount
        self.updated_at = datetime.now()
        
        if self.tech_tree.research_progress >= 100:
            self.unlock_technology(self.tech_tree.current_research)
            completed_tech = self.tech_tree.current_research
            self.tech_tree.current_research = None
            self.tech_tree.research_progress = 0
            return True
        
        return False
    
    def add_quest(self, quest_id: str, title: str, description: str) -> None:
        """Add a new quest to the player's quest history."""
        self.quest_history.append({
            "quest_id": quest_id,
            "title": title,
            "description": description,
            "status": "active",
            "started_at": datetime.now(),
            "completed_at": None
        })
        self.updated_at = datetime.now()
    
    def complete_quest(self, quest_id: str, outcome: str, karma_reward: int) -> None:
        """Mark a quest as completed."""
        for quest in self.quest_history:
            if quest["quest_id"] == quest_id and quest["status"] == "active":
                quest["status"] = "completed"
                quest["outcome"] = outcome
                quest["karma_reward"] = karma_reward
                quest["completed_at"] = datetime.now()
                self.add_karma(karma_reward, f"Completed quest: {quest['title']}")
                break
        self.updated_at = datetime.now()
