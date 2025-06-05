"""
Timeline Model
Represents a timeline in the ChronoCore game.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class Timeline(BaseModel):
    """
    Represents a timeline in the ChronoCore game.
    Each timeline contains multiple realms and has its own properties.
    """
    timeline_id: str = Field(..., description="Unique identifier for the timeline")
    name: str = Field(..., description="Name of the timeline")
    description: str = Field(..., description="Description of the timeline")
    type: str = Field(..., description="Type of timeline (e.g., Utopia, Dystopia, Tech Empire)")
    stability: int = Field(100, description="Stability of the timeline (0-100)")
    tech_level: int = Field(1, description="Technology level of the timeline (1-10)")
    karma_alignment: int = Field(0, description="Karma alignment of the timeline (-100 to 100)")
    realms: List[str] = Field(default_factory=list, description="IDs of realms within this timeline")
    events: List[Dict] = Field(default_factory=list, description="Events that have occurred in this timeline")
    connected_timelines: List[str] = Field(default_factory=list, description="IDs of timelines connected to this one")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    def add_event(self, event_type: str, description: str, impact: Dict) -> None:
        """Add a new event to the timeline's history."""
        self.events.append({
            "event_type": event_type,
            "description": description,
            "impact": impact,
            "timestamp": datetime.now()
        })
        
        # Apply impact to timeline properties
        if "stability" in impact:
            self.stability = max(0, min(100, self.stability + impact["stability"]))
        if "tech_level" in impact:
            self.tech_level = max(1, min(10, self.tech_level + impact["tech_level"]))
        if "karma_alignment" in impact:
            self.karma_alignment = max(-100, min(100, self.karma_alignment + impact["karma_alignment"]))
            
        self.updated_at = datetime.now()
    
    def add_realm(self, realm_id: str) -> None:
        """Add a realm to this timeline."""
        if realm_id not in self.realms:
            self.realms.append(realm_id)
            self.updated_at = datetime.now()
    
    def remove_realm(self, realm_id: str) -> None:
        """Remove a realm from this timeline."""
        if realm_id in self.realms:
            self.realms.remove(realm_id)
            self.updated_at = datetime.now()
    
    def connect_timeline(self, timeline_id: str) -> None:
        """Connect this timeline to another timeline."""
        if timeline_id not in self.connected_timelines:
            self.connected_timelines.append(timeline_id)
            self.updated_at = datetime.now()
    
    def disconnect_timeline(self, timeline_id: str) -> None:
        """Disconnect this timeline from another timeline."""
        if timeline_id in self.connected_timelines:
            self.connected_timelines.remove(timeline_id)
            self.updated_at = datetime.now()
    
    def is_stable(self) -> bool:
        """Check if the timeline is stable."""
        return self.stability >= 50
    
    def is_collapsing(self) -> bool:
        """Check if the timeline is in danger of collapsing."""
        return self.stability < 25
