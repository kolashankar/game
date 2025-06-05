"""
Quest Model
Represents a quest in the ChronoCore game.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class QuestOption(BaseModel):
    """Represents a possible choice for resolving a quest."""
    option_id: str = Field(..., description="Unique identifier for this option")
    description: str = Field(..., description="Description of this option")
    karma_impact: int = Field(..., description="Impact on player's karma if this option is chosen")
    tech_impact: int = Field(0, description="Impact on player's tech level if this option is chosen")
    timeline_impact: Dict = Field(default_factory=dict, description="Impact on timelines if this option is chosen")
    realm_impact: Dict = Field(default_factory=dict, description="Impact on realms if this option is chosen")


class QuestOutcome(BaseModel):
    """Represents the outcome of a completed quest."""
    description: str = Field(..., description="Description of the outcome")
    karma_reward: int = Field(..., description="Karma reward for completing the quest")
    tech_reward: int = Field(0, description="Tech reward for completing the quest")
    resource_rewards: Dict = Field(default_factory=dict, description="Resources rewarded for completing the quest")
    timeline_effects: List[Dict] = Field(default_factory=list, description="Effects on timelines")
    realm_effects: List[Dict] = Field(default_factory=list, description="Effects on realms")


class Quest(BaseModel):
    """
    Represents a quest in the ChronoCore game.
    Quests are AI-generated challenges for players.
    """
    quest_id: str = Field(..., description="Unique identifier for the quest")
    title: str = Field(..., description="Title of the quest")
    description: str = Field(..., description="Description of the quest")
    type: str = Field(..., description="Type of quest (e.g., Ethical, Technical, Diplomatic)")
    difficulty: int = Field(1, description="Difficulty level of the quest (1-5)")
    player_id: str = Field(..., description="ID of the player this quest is assigned to")
    timeline_id: Optional[str] = Field(None, description="ID of the timeline this quest is associated with")
    realm_id: Optional[str] = Field(None, description="ID of the realm this quest is associated with")
    options: List[QuestOption] = Field(..., description="Possible options for resolving the quest")
    requirements: Dict = Field(default_factory=dict, description="Requirements to complete the quest")
    outcome: Optional[QuestOutcome] = Field(None, description="Outcome of the quest if completed")
    status: str = Field("active", description="Status of the quest (active, completed, failed)")
    expiration_turn: Optional[int] = Field(None, description="Turn number when the quest expires")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = Field(None, description="When the quest was completed")
    
    def complete(self, chosen_option_id: str, outcome: QuestOutcome) -> None:
        """Mark the quest as completed with the chosen option and outcome."""
        self.status = "completed"
        self.outcome = outcome
        self.completed_at = datetime.now()
        self.updated_at = datetime.now()
    
    def fail(self, reason: str) -> None:
        """Mark the quest as failed."""
        self.status = "failed"
        self.updated_at = datetime.now()
    
    def is_expired(self, current_turn: int) -> bool:
        """Check if the quest has expired."""
        return self.expiration_turn is not None and current_turn > self.expiration_turn
    
    def is_active(self) -> bool:
        """Check if the quest is active."""
        return self.status == "active"
    
    def is_completed(self) -> bool:
        """Check if the quest is completed."""
        return self.status == "completed"
    
    def is_failed(self) -> bool:
        """Check if the quest is failed."""
        return self.status == "failed"
