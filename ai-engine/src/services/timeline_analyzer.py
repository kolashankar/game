"""
Timeline Analyzer Service
Analyzes timeline stability and predicts temporal events in the ChronoCore game.
"""

from typing import List, Dict, Any, Optional, Tuple
import asyncio
import math
import random
import logging
from datetime import datetime

from ..models.game_state import GameState
from ..models.timeline import Timeline
from ..models.realm import Realm
from ..data.embeddings_store import EmbeddingsStore
from ..utils.config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TimelineAnalyzer:
    """
    Service for analyzing timeline stability and predicting temporal events.
    Provides methods for calculating timeline stability, detecting paradoxes,
    and generating time rifts based on player actions and game state.
    """
    
    def __init__(self):
        """Initialize the timeline analyzer."""
        self.embeddings_store = EmbeddingsStore()
        
        # Constants for timeline stability calculations
        self.STABILITY_FACTORS = {
            "player_decisions": 0.4,    # Impact of player decisions
            "realm_alignment": 0.3,     # Impact of realm ethical alignment
            "tech_disparity": 0.2,      # Impact of technology level differences
            "time_rifts": 0.5,          # Impact of active time rifts
            "paradoxes": 0.7,           # Impact of paradoxes
            "cross_timeline_events": 0.3 # Impact of events affecting multiple timelines
        }
        
        # Thresholds for timeline events
        self.RIFT_THRESHOLD = 30        # Stability below this may create rifts
        self.PARADOX_THRESHOLD = 20     # Stability below this may create paradoxes
        self.MERGE_THRESHOLD = 90       # Similarity above this may cause timelines to merge
        self.SPLIT_THRESHOLD = 40       # Stability below this may cause timeline to split
    
    async def analyze_timeline(self, timeline_id: str, game_state: GameState) -> Dict:
        """
        Analyze a timeline and return detailed information about its state.
        
        Args:
            timeline_id: ID of the timeline to analyze
            game_state: Current game state
            
        Returns:
            Dictionary with analysis results
        """
        # Find the timeline
        timeline = None
        for t in game_state.timelines:
            if t.timeline_id == timeline_id:
                timeline = t
                break
        
        if timeline is None:
            logger.error(f"Timeline with ID {timeline_id} not found")
            return {"error": f"Timeline with ID {timeline_id} not found"}
        
        # Get realms in this timeline
        realms = [r for r in game_state.realms if r.timeline_id == timeline_id]
        
        # Calculate stability
        stability = await self.calculate_stability(timeline, realms, game_state)
        
        # Find potential paradoxes
        paradoxes = await self.detect_paradoxes(timeline, realms, game_state)
        
        # Calculate technology disparity
        tech_disparity = self._calculate_tech_disparity(realms)
        
        # Calculate ethical alignment
        ethical_alignment = self._calculate_ethical_alignment(realms)
        
        # Predict potential events
        potential_events = await self.predict_events(timeline, stability, paradoxes, game_state)
        
        # Compile analysis results
        analysis = {
            "timeline_id": timeline_id,
            "name": timeline.name,
            "stability": stability,
            "tech_disparity": tech_disparity,
            "ethical_alignment": ethical_alignment,
            "paradoxes": paradoxes,
            "potential_events": potential_events,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        return analysis
    
    async def calculate_stability(self, timeline: Timeline, realms: List[Realm], game_state: GameState) -> float:
        """
        Calculate the stability of a timeline.
        
        Args:
            timeline: The timeline to analyze
            realms: List of realms in the timeline
            game_state: Current game state
            
        Returns:
            Stability score (0-100)
        """
        # Base stability
        stability = timeline.stability
        
        # Impact of player decisions (from recent events)
        decision_impact = 0
        recent_events = game_state.events_history[-10:] if game_state.events_history else []
        for event in recent_events:
            # Check if this event affects this timeline
            if any(realm_id in timeline.realms for realm_id in event.get("affected_realms", [])):
                decision_impact += event.get("karma_impact", 0) * 0.5
        
        # Normalize decision impact to -20 to +20 range
        decision_impact = max(-20, min(20, decision_impact))
        
        # Impact of realm alignment
        alignment_impact = self._calculate_ethical_alignment(realms)
        # Convert from -100 to 100 scale to -10 to 10 scale
        alignment_impact = alignment_impact / 10
        
        # Impact of technology disparity
        tech_disparity = self._calculate_tech_disparity(realms)
        # Higher disparity reduces stability (0-10 scale)
        tech_impact = -tech_disparity
        
        # Impact of time rifts
        rift_impact = 0
        for rift in game_state.time_rifts:
            if not rift.get("resolved", False):
                # Check if rift affects this timeline
                rift_location = rift.get("location", {})
                if rift_location.get("timeline_id") == timeline.timeline_id:
                    rift_impact -= rift.get("severity", 1) * 5
        
        # Impact of paradoxes
        paradox_impact = 0
        paradoxes = await self.detect_paradoxes(timeline, realms, game_state)
        paradox_impact = -len(paradoxes) * 10
        
        # Calculate final stability
        stability += (
            decision_impact * self.STABILITY_FACTORS["player_decisions"] +
            alignment_impact * self.STABILITY_FACTORS["realm_alignment"] +
            tech_impact * self.STABILITY_FACTORS["tech_disparity"] +
            rift_impact * self.STABILITY_FACTORS["time_rifts"] +
            paradox_impact * self.STABILITY_FACTORS["paradoxes"]
        )
        
        # Ensure stability is within bounds
        stability = max(0, min(100, stability))
        
        return stability
    
    async def detect_paradoxes(self, timeline: Timeline, realms: List[Realm], game_state: GameState) -> List[Dict]:
        """
        Detect potential paradoxes in a timeline.
        
        Args:
            timeline: The timeline to analyze
            realms: List of realms in the timeline
            game_state: Current game state
            
        Returns:
            List of detected paradoxes
        """
        paradoxes = []
        
        # Check for technology level inversions (more advanced tech in earlier eras)
        tech_levels = [(r.realm_id, r.development_level) for r in realms]
        for i, (realm_id1, level1) in enumerate(tech_levels):
            for realm_id2, level2 in tech_levels[i+1:]:
                # If tech levels are significantly different
                if abs(level1 - level2) > 3:
                    paradoxes.append({
                        "type": "tech_inversion",
                        "description": f"Significant technology disparity between realms {realm_id1} and {realm_id2}",
                        "severity": abs(level1 - level2) / 2,
                        "affected_realms": [realm_id1, realm_id2]
                    })
        
        # Check for ethical alignment contradictions
        ethical_values = [(r.realm_id, r.ethical_alignment) for r in realms]
        for i, (realm_id1, value1) in enumerate(ethical_values):
            for realm_id2, value2 in ethical_values[i+1:]:
                # If ethical values are polar opposites
                if value1 * value2 < 0 and abs(value1 - value2) > 150:
                    paradoxes.append({
                        "type": "ethical_contradiction",
                        "description": f"Fundamental ethical contradiction between realms {realm_id1} and {realm_id2}",
                        "severity": abs(value1 - value2) / 30,
                        "affected_realms": [realm_id1, realm_id2]
                    })
        
        # Check for cross-timeline contamination in recent events
        recent_events = game_state.events_history[-15:] if game_state.events_history else []
        for event in recent_events:
            affected_realms = event.get("affected_realms", [])
            # Get timelines for each affected realm
            event_timelines = set()
            for realm_id in affected_realms:
                for r in game_state.realms:
                    if r.realm_id == realm_id:
                        event_timelines.add(r.timeline_id)
                        break
            
            # If event affects multiple timelines, it might cause paradoxes
            if len(event_timelines) > 1 and timeline.timeline_id in event_timelines:
                paradoxes.append({
                    "type": "cross_timeline_contamination",
                    "description": f"Event affecting multiple timelines: {event.get('description', 'Unknown event')}",
                    "severity": len(event_timelines) * 1.5,
                    "affected_timelines": list(event_timelines)
                })
        
        return paradoxes
    
    async def predict_events(self, timeline: Timeline, stability: float, paradoxes: List[Dict], game_state: GameState) -> List[Dict]:
        """
        Predict potential temporal events based on timeline analysis.
        
        Args:
            timeline: The timeline to analyze
            stability: Calculated stability score
            paradoxes: Detected paradoxes
            game_state: Current game state
            
        Returns:
            List of potential events
        """
        potential_events = []
        
        # Potential time rifts
        if stability < self.RIFT_THRESHOLD:
            # Higher chance of rifts as stability decreases
            rift_chance = (self.RIFT_THRESHOLD - stability) / self.RIFT_THRESHOLD
            if random.random() < rift_chance:
                # Determine severity based on stability
                severity = int((self.RIFT_THRESHOLD - stability) / 5) + 1
                severity = min(5, max(1, severity))
                
                potential_events.append({
                    "type": "time_rift",
                    "description": f"Potential time rift forming in timeline {timeline.name}",
                    "probability": rift_chance * 100,
                    "severity": severity,
                    "trigger_condition": f"Timeline stability below {self.RIFT_THRESHOLD}"
                })
        
        # Potential timeline splits
        if stability < self.SPLIT_THRESHOLD:
            # Calculate split probability
            split_chance = (self.SPLIT_THRESHOLD - stability) / self.SPLIT_THRESHOLD
            if len(paradoxes) > 0:
                split_chance *= 1.5  # Paradoxes increase split chance
            
            if split_chance > 0.3:  # Only suggest if reasonably likely
                potential_events.append({
                    "type": "timeline_split",
                    "description": f"Timeline {timeline.name} may split into multiple branches",
                    "probability": split_chance * 100,
                    "severity": 4,
                    "trigger_condition": f"Timeline stability below {self.SPLIT_THRESHOLD} with {len(paradoxes)} paradoxes"
                })
        
        # Potential timeline merges
        if stability > 70:
            # Check for similar timelines that could merge
            similar_timelines = await self._find_similar_timelines(timeline, game_state)
            for similar in similar_timelines:
                merge_chance = similar["similarity"] / 100
                if merge_chance > 0.7:  # Only suggest if reasonably likely
                    potential_events.append({
                        "type": "timeline_merge",
                        "description": f"Timeline {timeline.name} may merge with {similar['timeline_name']}",
                        "probability": merge_chance * 100,
                        "severity": 3,
                        "trigger_condition": f"Timeline similarity above {self.MERGE_THRESHOLD}%"
                    })
        
        # Potential paradox resolutions or amplifications
        for paradox in paradoxes:
            if stability < 50:
                # Paradox amplification
                potential_events.append({
                    "type": "paradox_amplification",
                    "description": f"Paradox may amplify: {paradox['description']}",
                    "probability": (50 - stability) * 2,
                    "severity": paradox['severity'] + 1,
                    "trigger_condition": "Continued timeline instability"
                })
            else:
                # Paradox resolution
                potential_events.append({
                    "type": "paradox_resolution",
                    "description": f"Paradox may naturally resolve: {paradox['description']}",
                    "probability": stability - 30,
                    "severity": 1,
                    "trigger_condition": "Continued timeline stability"
                })
        
        return potential_events
    
    async def generate_time_rift(self, game_state: GameState) -> Optional[Dict]:
        """
        Generate a time rift based on the current game state.
        
        Args:
            game_state: Current game state
            
        Returns:
            Time rift data or None if no rift should be generated
        """
        # Check all timelines for potential rift locations
        rift_candidates = []
        
        for timeline in game_state.timelines:
            # Calculate stability
            realms = [r for r in game_state.realms if r.timeline_id == timeline.timeline_id]
            stability = await self.calculate_stability(timeline, realms, game_state)
            
            # If stability is below threshold, this timeline is a candidate for a rift
            if stability < self.RIFT_THRESHOLD:
                rift_chance = (self.RIFT_THRESHOLD - stability) / self.RIFT_THRESHOLD
                rift_candidates.append({
                    "timeline": timeline,
                    "realms": realms,
                    "stability": stability,
                    "chance": rift_chance
                })
        
        if not rift_candidates:
            return None
        
        # Sort candidates by chance (highest first)
        rift_candidates.sort(key=lambda x: x["chance"], reverse=True)
        
        # Select a candidate based on probability
        selected = None
        for candidate in rift_candidates:
            if random.random() < candidate["chance"]:
                selected = candidate
                break
        
        if not selected:
            return None
        
        # Select a realm within the timeline for the rift location
        if not selected["realms"]:
            return None
        
        realm = random.choice(selected["realms"])
        
        # Determine rift severity based on stability
        severity = int((self.RIFT_THRESHOLD - selected["stability"]) / 5) + 1
        severity = min(5, max(1, severity))
        
        # Generate rift description based on severity
        descriptions = [
            "A minor temporal distortion causing slight anomalies in local time flow.",
            "A noticeable time rift causing objects to age at different rates.",
            "A significant temporal anomaly creating pockets of accelerated or slowed time.",
            "A major time rift causing temporal echoes and allowing glimpses of alternate timelines.",
            "A critical temporal fracture threatening to tear the fabric of reality in this realm."
        ]
        
        description = descriptions[severity-1]
        
        # Create the time rift
        time_rift = {
            "location": {
                "timeline_id": selected["timeline"].timeline_id,
                "realm_id": realm.realm_id,
                "coordinates": {
                    "x": random.randint(0, 100),
                    "y": random.randint(0, 100)
                }
            },
            "severity": severity,
            "description": description,
            "created_at_turn": game_state.current_turn,
            "resolved": False
        }
        
        return time_rift
    
    async def calculate_timeline_similarity(self, timeline1: Timeline, timeline2: Timeline, game_state: GameState) -> float:
        """
        Calculate similarity between two timelines.
        
        Args:
            timeline1: First timeline
            timeline2: Second timeline
            game_state: Current game state
            
        Returns:
            Similarity score (0-100)
        """
        # Get realms for each timeline
        realms1 = [r for r in game_state.realms if r.timeline_id == timeline1.timeline_id]
        realms2 = [r for r in game_state.realms if r.timeline_id == timeline2.timeline_id]
        
        if not realms1 or not realms2:
            return 0.0
        
        # Compare technology levels
        tech_similarity = self._compare_tech_levels(realms1, realms2)
        
        # Compare ethical alignments
        ethical_similarity = self._compare_ethical_alignments(realms1, realms2)
        
        # Compare events
        event_similarity = await self._compare_timeline_events(timeline1, timeline2, game_state)
        
        # Calculate overall similarity
        similarity = (tech_similarity * 0.3) + (ethical_similarity * 0.4) + (event_similarity * 0.3)
        
        # Scale to 0-100
        similarity = similarity * 100
        
        return similarity
    
    def _calculate_tech_disparity(self, realms: List[Realm]) -> float:
        """
        Calculate technology disparity among realms in a timeline.
        
        Args:
            realms: List of realms
            
        Returns:
            Technology disparity score (0-10)
        """
        if not realms or len(realms) == 1:
            return 0.0
        
        tech_levels = [r.development_level for r in realms]
        avg_tech = sum(tech_levels) / len(tech_levels)
        
        # Calculate standard deviation
        variance = sum((level - avg_tech) ** 2 for level in tech_levels) / len(tech_levels)
        std_dev = math.sqrt(variance)
        
        # Normalize to 0-10 scale
        disparity = min(10, std_dev * 2)
        
        return disparity
    
    def _calculate_ethical_alignment(self, realms: List[Realm]) -> float:
        """
        Calculate average ethical alignment of realms in a timeline.
        
        Args:
            realms: List of realms
            
        Returns:
            Ethical alignment score (-100 to 100)
        """
        if not realms:
            return 0.0
        
        alignments = [r.ethical_alignment for r in realms]
        avg_alignment = sum(alignments) / len(alignments)
        
        return avg_alignment
    
    def _compare_tech_levels(self, realms1: List[Realm], realms2: List[Realm]) -> float:
        """
        Compare technology levels between two sets of realms.
        
        Args:
            realms1: First set of realms
            realms2: Second set of realms
            
        Returns:
            Similarity score (0-1)
        """
        if not realms1 or not realms2:
            return 0.0
        
        avg_tech1 = sum(r.development_level for r in realms1) / len(realms1)
        avg_tech2 = sum(r.development_level for r in realms2) / len(realms2)
        
        # Calculate similarity based on difference
        max_diff = 10  # Maximum possible technology level difference
        diff = abs(avg_tech1 - avg_tech2)
        similarity = 1.0 - (diff / max_diff)
        
        return max(0.0, similarity)
    
    def _compare_ethical_alignments(self, realms1: List[Realm], realms2: List[Realm]) -> float:
        """
        Compare ethical alignments between two sets of realms.
        
        Args:
            realms1: First set of realms
            realms2: Second set of realms
            
        Returns:
            Similarity score (0-1)
        """
        if not realms1 or not realms2:
            return 0.0
        
        avg_align1 = sum(r.ethical_alignment for r in realms1) / len(realms1)
        avg_align2 = sum(r.ethical_alignment for r in realms2) / len(realms2)
        
        # Calculate similarity based on difference
        max_diff = 200  # Maximum possible ethical alignment difference (-100 to 100)
        diff = abs(avg_align1 - avg_align2)
        similarity = 1.0 - (diff / max_diff)
        
        return max(0.0, similarity)
    
    async def _compare_timeline_events(self, timeline1: Timeline, timeline2: Timeline, game_state: GameState) -> float:
        """
        Compare events between two timelines.
        
        Args:
            timeline1: First timeline
            timeline2: Second timeline
            game_state: Current game state
            
        Returns:
            Similarity score (0-1)
        """
        # Get events for each timeline
        events1 = [e for e in timeline1.events]
        events2 = [e for e in timeline2.events]
        
        if not events1 or not events2:
            return 0.5  # Neutral similarity if no events to compare
        
        # Compare event types and outcomes
        common_events = 0
        total_events = max(len(events1), len(events2))
        
        for event1 in events1:
            for event2 in events2:
                if event1["type"] == event2["type"]:
                    common_events += 0.5
                    if event1.get("outcome") == event2.get("outcome"):
                        common_events += 0.5
        
        similarity = common_events / total_events if total_events > 0 else 0.5
        
        return similarity
    
    async def _find_similar_timelines(self, target_timeline: Timeline, game_state: GameState) -> List[Dict]:
        """
        Find timelines similar to the target timeline.
        
        Args:
            target_timeline: The timeline to compare against
            game_state: Current game state
            
        Returns:
            List of similar timelines with similarity scores
        """
        similar_timelines = []
        
        for timeline in game_state.timelines:
            # Skip the target timeline itself
            if timeline.timeline_id == target_timeline.timeline_id:
                continue
            
            # Calculate similarity
            similarity = await self.calculate_timeline_similarity(target_timeline, timeline, game_state)
            
            if similarity > 50:  # Only include reasonably similar timelines
                similar_timelines.append({
                    "timeline_id": timeline.timeline_id,
                    "timeline_name": timeline.name,
                    "similarity": similarity
                })
        
        # Sort by similarity (highest first)
        similar_timelines.sort(key=lambda x: x["similarity"], reverse=True)
        
        return similar_timelines
