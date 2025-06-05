"""
Realm Manager Service
Manages realm development, resources, and population dynamics in the ChronoCore game.
"""

from typing import List, Dict, Any, Optional, Tuple
import asyncio
import math
import random
import logging
from datetime import datetime

from ..models.game_state import GameState
from ..models.realm import Realm
from ..models.player import Player
from ..data.prompt_templates import PromptTemplates
from ..utils.config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealmManager:
    """
    Service for managing realm development and interactions.
    Handles resource allocation, population growth, technological advancement,
    and cultural evolution of realms in the ChronoCore game.
    """
    
    def __init__(self):
        """Initialize the realm manager."""
        # Constants for realm development calculations
        self.GROWTH_FACTORS = {
            "base_growth_rate": 0.05,    # Base population growth rate per turn
            "resource_impact": 0.02,     # Impact of resources on growth
            "tech_impact": 0.03,         # Impact of technology on growth
            "stability_impact": 0.04,    # Impact of timeline stability on growth
            "karma_impact": 0.01         # Impact of karma on growth
        }
        
        # Technology focus impacts
        self.TECH_FOCUS_IMPACTS = {
            "Balanced": {"resources": 1.0, "population": 1.0, "ethical": 0.0},
            "Military": {"resources": 1.2, "population": 0.8, "ethical": -0.5},
            "Scientific": {"resources": 0.9, "population": 1.0, "ethical": 0.2},
            "Cultural": {"resources": 0.8, "population": 1.2, "ethical": 0.5},
            "Economic": {"resources": 1.5, "population": 0.9, "ethical": -0.2},
            "Spiritual": {"resources": 0.7, "population": 1.1, "ethical": 0.7},
            "Ecological": {"resources": 0.9, "population": 1.0, "ethical": 0.6}
        }
        
        # Development thresholds for technology levels
        self.TECH_LEVEL_THRESHOLDS = [
            0,      # Level 1: Basic tools and simple machines
            100,    # Level 2: Early industrial
            250,    # Level 3: Industrial revolution
            500,    # Level 4: Information age
            1000,   # Level 5: Early AI and automation
            2000,   # Level 6: Advanced AI and quantum computing
            4000,   # Level 7: Post-scarcity technologies
            8000,   # Level 8: Molecular manufacturing
            16000,  # Level 9: Controlled singularity
            32000   # Level 10: Transcendent technologies
        ]
    
    async def update_realm(self, realm: Realm, game_state: GameState) -> Realm:
        """
        Update a realm based on current game state and player decisions.
        
        Args:
            realm: The realm to update
            game_state: Current game state
            
        Returns:
            Updated realm
        """
        # Calculate resource growth
        resources_change = await self._calculate_resource_change(realm, game_state)
        
        # Calculate population growth
        population_change = await self._calculate_population_change(realm, game_state)
        
        # Calculate development progress
        development_progress = await self._calculate_development_progress(realm, game_state)
        
        # Update realm values
        realm.resources += resources_change
        realm.population += population_change
        
        # Check if realm has reached a new technology level
        current_dev_points = realm.development_level * self.TECH_LEVEL_THRESHOLDS[min(9, realm.development_level)]
        new_dev_points = current_dev_points + development_progress
        
        # Determine new tech level
        new_level = 1
        for level, threshold in enumerate(self.TECH_LEVEL_THRESHOLDS):
            if new_dev_points >= threshold:
                new_level = level + 1
            else:
                break
        
        # If tech level increased, update description
        if new_level > realm.development_level:
            realm.development_level = new_level
            realm.description = await self._generate_realm_description(realm, game_state)
        
        # Update ethical alignment based on recent decisions
        ethical_shift = await self._calculate_ethical_shift(realm, game_state)
        realm.ethical_alignment += ethical_shift
        
        # Ensure ethical alignment stays within bounds (-100 to 100)
        realm.ethical_alignment = max(-100, min(100, realm.ethical_alignment))
        
        return realm
    
    async def process_realm_event(self, realm: Realm, event_type: str, event_data: Dict, game_state: GameState) -> Tuple[Realm, Dict]:
        """
        Process a specific event affecting a realm.
        
        Args:
            realm: The realm affected by the event
            event_type: Type of event (e.g., "disaster", "discovery", "cultural_shift")
            event_data: Data specific to the event
            game_state: Current game state
            
        Returns:
            Tuple of (updated realm, event outcome)
        """
        outcome = {"description": "", "effects": {}}
        
        if event_type == "disaster":
            # Process natural or technological disaster
            severity = event_data.get("severity", 1)
            
            # Calculate impact based on severity and realm's technology level
            resource_impact = -severity * (10 + random.randint(5, 20))
            population_impact = -severity * (1000 + random.randint(500, 2000))
            
            # Technology can mitigate disasters
            mitigation = min(0.8, realm.development_level * 0.1)
            resource_impact = int(resource_impact * (1 - mitigation))
            population_impact = int(population_impact * (1 - mitigation))
            
            # Apply changes
            realm.resources = max(10, realm.resources + resource_impact)
            realm.population = max(1000, realm.population + population_impact)
            
            # Create outcome description
            outcome["description"] = f"A {event_data.get('name', 'disaster')} has struck {realm.name}, causing significant damage."
            outcome["effects"] = {
                "resources": resource_impact,
                "population": population_impact,
                "development": -severity
            }
            
        elif event_type == "discovery":
            # Process scientific or technological discovery
            importance = event_data.get("importance", 1)
            
            # Calculate impact
            resource_impact = importance * (5 + random.randint(5, 15))
            development_impact = importance * (10 + random.randint(5, 20))
            
            # Apply changes
            realm.resources += resource_impact
            
            # Add to development progress
            current_dev_points = realm.development_level * self.TECH_LEVEL_THRESHOLDS[min(9, realm.development_level)]
            new_dev_points = current_dev_points + development_impact
            
            # Check for technology level increase
            new_level = 1
            for level, threshold in enumerate(self.TECH_LEVEL_THRESHOLDS):
                if new_dev_points >= threshold:
                    new_level = level + 1
                else:
                    break
            
            if new_level > realm.development_level:
                realm.development_level = new_level
                realm.description = await self._generate_realm_description(realm, game_state)
            
            # Create outcome description
            outcome["description"] = f"A significant {event_data.get('name', 'discovery')} has been made in {realm.name}, advancing their technology."
            outcome["effects"] = {
                "resources": resource_impact,
                "development": development_impact,
                "tech_level": realm.development_level
            }
            
        elif event_type == "cultural_shift":
            # Process cultural or ethical shift
            direction = event_data.get("direction", 0)  # -1 for negative, 0 for neutral, 1 for positive
            magnitude = event_data.get("magnitude", 5)
            
            # Calculate ethical shift
            ethical_impact = direction * magnitude
            
            # Apply changes
            realm.ethical_alignment += ethical_impact
            realm.ethical_alignment = max(-100, min(100, realm.ethical_alignment))
            
            # Create outcome description
            shift_type = "positive" if direction > 0 else "negative" if direction < 0 else "neutral"
            outcome["description"] = f"A {shift_type} cultural shift has occurred in {realm.name}, changing their ethical alignment."
            outcome["effects"] = {
                "ethical_alignment": ethical_impact
            }
            
        elif event_type == "resource_discovery":
            # Process discovery of new resources
            amount = event_data.get("amount", 20)
            
            # Apply changes
            realm.resources += amount
            
            # Create outcome description
            outcome["description"] = f"New resources have been discovered in {realm.name}, increasing their available resources."
            outcome["effects"] = {
                "resources": amount
            }
            
        elif event_type == "population_change":
            # Process significant population change (migration, etc.)
            amount = event_data.get("amount", 5000)
            
            # Apply changes
            realm.population += amount
            realm.population = max(1000, realm.population)  # Ensure minimum population
            
            # Create outcome description
            if amount > 0:
                outcome["description"] = f"A significant population increase has occurred in {realm.name}."
            else:
                outcome["description"] = f"A significant population decrease has occurred in {realm.name}."
            
            outcome["effects"] = {
                "population": amount
            }
        
        return realm, outcome
    
    async def transfer_realm_ownership(self, realm: Realm, new_owner_id: str, game_state: GameState) -> Tuple[Realm, Dict]:
        """
        Transfer ownership of a realm to a new player.
        
        Args:
            realm: The realm to transfer
            new_owner_id: ID of the new owner
            game_state: Current game state
            
        Returns:
            Tuple of (updated realm, transfer outcome)
        """
        old_owner_id = realm.owner_id
        realm.owner_id = new_owner_id
        
        # Find new owner's player object
        new_owner = None
        for player in game_state.players:
            if player.player_id == new_owner_id:
                new_owner = player
                break
        
        outcome = {
            "description": f"Ownership of {realm.name} has been transferred from Player {old_owner_id} to Player {new_owner_id}.",
            "old_owner": old_owner_id,
            "new_owner": new_owner_id
        }
        
        # Apply owner's ethical influence
        if new_owner:
            # Gradually shift realm's ethical alignment toward owner's karma
            karma_influence = new_owner.karma * 0.1
            realm.ethical_alignment += karma_influence
            realm.ethical_alignment = max(-100, min(100, realm.ethical_alignment))
            
            outcome["ethical_shift"] = karma_influence
        
        return realm, outcome
    
    async def generate_realm_event(self, realm: Realm, game_state: GameState) -> Optional[Dict]:
        """
        Generate a random event for a realm based on its current state.
        
        Args:
            realm: The realm to generate an event for
            game_state: Current game state
            
        Returns:
            Event data or None if no event should occur
        """
        # Base chance of an event occurring
        event_chance = 0.2
        
        # Modify chance based on realm development level
        event_chance += realm.development_level * 0.02
        
        # Modify chance based on timeline stability
        timeline = None
        for t in game_state.timelines:
            if realm.timeline_id == t.timeline_id:
                timeline = t
                break
        
        if timeline and hasattr(timeline, 'stability'):
            # Less stable timelines have more events
            event_chance += (100 - timeline.stability) * 0.002
        
        # Random check if event occurs
        if random.random() > event_chance:
            return None
        
        # Determine event type
        event_types = ["disaster", "discovery", "cultural_shift", "resource_discovery", "population_change"]
        weights = [0.15, 0.25, 0.2, 0.2, 0.2]
        
        # Adjust weights based on realm state
        if realm.resources < 30:
            # More likely to discover resources when low
            weights[3] += 0.1
        
        if realm.development_level > 5:
            # Advanced realms more likely to have discoveries
            weights[1] += 0.1
            # Less likely to have disasters
            weights[0] -= 0.05
        
        # Normalize weights
        total_weight = sum(weights)
        weights = [w / total_weight for w in weights]
        
        # Select event type
        event_type = random.choices(event_types, weights=weights)[0]
        
        # Generate event data
        event_data = {"type": event_type}
        
        if event_type == "disaster":
            severity = random.randint(1, 3)
            disaster_types = ["natural disaster", "technological failure", "disease outbreak", "social unrest"]
            
            event_data.update({
                "name": random.choice(disaster_types),
                "severity": severity,
                "description": f"A {severity}-level disaster has occurred in {realm.name}."
            })
            
        elif event_type == "discovery":
            importance = random.randint(1, 4)
            discovery_types = ["scientific breakthrough", "technological innovation", "cultural renaissance", "resource extraction method"]
            
            event_data.update({
                "name": random.choice(discovery_types),
                "importance": importance,
                "description": f"An importance level {importance} discovery has been made in {realm.name}."
            })
            
        elif event_type == "cultural_shift":
            direction = random.choice([-1, 0, 1])
            magnitude = random.randint(3, 10)
            
            shift_type = "positive" if direction > 0 else "negative" if direction < 0 else "neutral"
            event_data.update({
                "direction": direction,
                "magnitude": magnitude,
                "description": f"A {shift_type} cultural shift of magnitude {magnitude} is occurring in {realm.name}."
            })
            
        elif event_type == "resource_discovery":
            amount = random.randint(10, 50)
            
            event_data.update({
                "amount": amount,
                "description": f"New resources worth {amount} units have been discovered in {realm.name}."
            })
            
        elif event_type == "population_change":
            # Can be positive or negative
            direction = 1 if random.random() > 0.3 else -1
            amount = direction * random.randint(1000, 10000)
            
            change_type = "increase" if amount > 0 else "decrease"
            event_data.update({
                "amount": amount,
                "description": f"A population {change_type} of {abs(amount)} is occurring in {realm.name}."
            })
        
        return event_data
    
    async def _calculate_resource_change(self, realm: Realm, game_state: GameState) -> int:
        """
        Calculate resource change for a realm in one turn.
        
        Args:
            realm: The realm to calculate for
            game_state: Current game state
            
        Returns:
            Resource change amount
        """
        # Base resource growth
        base_growth = 5
        
        # Population factor (more population = more resources)
        population_factor = math.log10(max(1000, realm.population)) - 2
        
        # Technology factor
        tech_factor = realm.development_level * 0.5
        
        # Tech focus impact
        focus_impact = self.TECH_FOCUS_IMPACTS.get(realm.technology_focus, {"resources": 1.0})["resources"]
        
        # Calculate total growth
        growth = base_growth + (population_factor * tech_factor * focus_impact)
        
        # Random variation (+/- 20%)
        variation = random.uniform(0.8, 1.2)
        growth *= variation
        
        return int(growth)
    
    async def _calculate_population_change(self, realm: Realm, game_state: GameState) -> int:
        """
        Calculate population change for a realm in one turn.
        
        Args:
            realm: The realm to calculate for
            game_state: Current game state
            
        Returns:
            Population change amount
        """
        # Base growth rate
        growth_rate = self.GROWTH_FACTORS["base_growth_rate"]
        
        # Resource impact (more resources = faster growth)
        resource_factor = min(2.0, realm.resources / 50)
        growth_rate += resource_factor * self.GROWTH_FACTORS["resource_impact"]
        
        # Technology impact
        tech_factor = realm.development_level * self.GROWTH_FACTORS["tech_impact"]
        growth_rate += tech_factor
        
        # Tech focus impact
        focus_impact = self.TECH_FOCUS_IMPACTS.get(realm.technology_focus, {"population": 1.0})["population"]
        growth_rate *= focus_impact
        
        # Calculate population change
        change = int(realm.population * growth_rate)
        
        # Random variation (+/- 10%)
        variation = random.uniform(0.9, 1.1)
        change = int(change * variation)
        
        return change
    
    async def _calculate_development_progress(self, realm: Realm, game_state: GameState) -> int:
        """
        Calculate technological development progress for a realm in one turn.
        
        Args:
            realm: The realm to calculate for
            game_state: Current game state
            
        Returns:
            Development progress points
        """
        # Base development rate
        base_rate = 5
        
        # Population factor (more population = more development)
        population_factor = math.log10(max(1000, realm.population)) - 2
        
        # Resource factor
        resource_factor = math.sqrt(max(1, realm.resources)) * 0.5
        
        # Current tech level factor (diminishing returns)
        tech_level_factor = 1.0 / math.sqrt(realm.development_level)
        
        # Calculate progress
        progress = base_rate + (population_factor * resource_factor * tech_level_factor)
        
        # Random variation (+/- 15%)
        variation = random.uniform(0.85, 1.15)
        progress *= variation
        
        return int(progress)
    
    async def _calculate_ethical_shift(self, realm: Realm, game_state: GameState) -> float:
        """
        Calculate ethical alignment shift for a realm in one turn.
        
        Args:
            realm: The realm to calculate for
            game_state: Current game state
            
        Returns:
            Ethical alignment shift
        """
        # Default shift (slight regression toward neutral)
        if realm.ethical_alignment > 0:
            base_shift = -0.5
        elif realm.ethical_alignment < 0:
            base_shift = 0.5
        else:
            base_shift = 0
        
        # Owner influence
        owner_influence = 0
        if realm.owner_id:
            for player in game_state.players:
                if player.player_id == realm.owner_id:
                    # Owner's karma influences realm alignment
                    karma_direction = 1 if player.karma > 0 else -1 if player.karma < 0 else 0
                    owner_influence = karma_direction * min(2.0, abs(player.karma) * 0.1)
                    break
        
        # Tech focus impact
        focus_impact = self.TECH_FOCUS_IMPACTS.get(realm.technology_focus, {"ethical": 0.0})["ethical"]
        
        # Recent events impact
        events_impact = 0
        recent_events = game_state.events_history[-5:] if game_state.events_history else []
        for event in recent_events:
            # Check if this event affects this realm
            if realm.realm_id in event.get("affected_realms", []):
                events_impact += event.get("karma_impact", 0) * 0.2
        
        # Calculate total shift
        shift = base_shift + owner_influence + focus_impact + events_impact
        
        # Limit maximum shift per turn
        shift = max(-5.0, min(5.0, shift))
        
        return shift
    
    async def _generate_realm_description(self, realm: Realm, game_state: GameState) -> str:
        """
        Generate a description for a realm based on its current state.
        
        Args:
            realm: The realm to generate a description for
            game_state: Current game state
            
        Returns:
            Generated description
        """
        # Technology level descriptions
        tech_descriptions = [
            "A primitive realm with basic tools and simple machines.",
            "A pre-industrial realm with early mechanical technologies.",
            "An industrial realm with steam power and mass production.",
            "A modern realm with computers and information technology.",
            "An advanced realm with early AI and automation systems.",
            "A highly advanced realm with quantum computing and advanced AI.",
            "A post-scarcity realm with matter manipulation technology.",
            "A realm with molecular manufacturing and complete resource control.",
            "A realm approaching technological singularity.",
            "A transcendent realm with technologies beyond conventional understanding."
        ]
        
        # Ethical alignment descriptions
        if realm.ethical_alignment > 70:
            ethical_desc = "highly ethical and altruistic"
        elif realm.ethical_alignment > 30:
            ethical_desc = "generally ethical and cooperative"
        elif realm.ethical_alignment > -30:
            ethical_desc = "ethically balanced"
        elif realm.ethical_alignment > -70:
            ethical_desc = "somewhat unethical and self-interested"
        else:
            ethical_desc = "highly unethical and exploitative"
        
        # Population size descriptions
        if realm.population > 10000000:
            pop_desc = "massive"
        elif realm.population > 1000000:
            pop_desc = "large"
        elif realm.population > 100000:
            pop_desc = "moderate"
        else:
            pop_desc = "small"
        
        # Technology focus description
        focus_desc = realm.technology_focus.lower() if realm.technology_focus else "balanced"
        
        # Combine elements
        tech_level_idx = min(9, max(0, realm.development_level - 1))
        description = f"{realm.name}: {tech_descriptions[tech_level_idx]} It has a {pop_desc} population with a {focus_desc} technology focus and a {ethical_desc} society."
        
        return description
