"""
Karma Calculator Service
Calculates karma impacts for player actions and decisions.
"""

from typing import List, Dict, Optional
import asyncio
import math
import random

from ..models.player import Player


class KarmaCalculator:
    """
    Service for calculating karma impacts for player actions and decisions.
    Karma is a central mechanic in ChronoCore that reflects the ethical alignment of players.
    """
    
    def __init__(self):
        """Initialize the karma calculator with default weights."""
        # Weights for different factors in karma calculation
        self.weights = {
            "decision_base": 1.0,      # Base weight for decision evaluations
            "player_role": 0.2,        # Role-specific modifier
            "timeline_alignment": 0.3,  # Alignment with timeline's karma
            "consecutive_actions": 0.5, # Impact of consecutive similar actions
            "game_era": 0.4            # Different eras have different karma sensitivities
        }
        
        # Role-specific karma modifiers
        self.role_modifiers = {
            "Techno Monk": {"ethical": 1.2, "technological": 0.8, "temporal": 1.0},
            "Shadow Broker": {"ethical": 0.8, "technological": 1.0, "temporal": 1.2},
            "Chrono Diplomat": {"ethical": 1.0, "technological": 0.8, "temporal": 1.2},
            "Bio-Smith": {"ethical": 1.1, "technological": 1.2, "temporal": 0.7}
        }
        
        # Era-specific karma modifiers
        self.era_modifiers = {
            "Initiation": 0.8,    # Early game - karma impacts are less severe
            "Progression": 1.0,   # Mid game - standard karma impact
            "Distortion": 1.2,    # Late mid-game - increased karma sensitivity
            "Equilibrium": 1.5    # End game - karma has highest impact
        }
        
        # Action type categories for tracking consecutive actions
        self.action_categories = {
            "ethical_positive": ["help", "save", "protect", "heal", "share"],
            "ethical_negative": ["harm", "destroy", "betray", "steal", "lie"],
            "tech_positive": ["research", "develop", "innovate", "build", "upgrade"],
            "tech_negative": ["sabotage", "corrupt", "weaponize", "exploit"],
            "temporal_positive": ["stabilize", "balance", "harmonize", "connect"],
            "temporal_negative": ["disrupt", "fracture", "collapse", "sever"]
        }
        
        # Player action history cache (would be stored in database in production)
        self.player_action_history = {}
    
    async def calculate(self, player_id: str, decision: str, evaluation: Dict) -> int:
        """
        Calculate karma impact for a single decision based on its evaluation.
        
        Args:
            player_id: The ID of the player making the decision
            decision: The decision text
            evaluation: The evaluation results from the DecisionEngine
            
        Returns:
            The calculated karma impact as an integer
        """
        # Base karma from evaluation
        base_karma = evaluation.get("karma_score", 0)
        
        # Apply role modifier if available in the evaluation context
        role = evaluation.get("player_role", None)
        role_modifier = 1.0
        
        if role in self.role_modifiers:
            # Apply different weights based on the impact types
            ethical_weight = self.role_modifiers[role]["ethical"]
            tech_weight = self.role_modifiers[role]["technological"]
            temporal_weight = self.role_modifiers[role]["temporal"]
            
            # Determine which impact type is most relevant to this decision
            if "ethical_impact" in evaluation and evaluation["ethical_impact"]:
                role_modifier = ethical_weight
            elif "technological_impact" in evaluation and evaluation["technological_impact"]:
                role_modifier = tech_weight
            elif "temporal_impact" in evaluation and evaluation["temporal_impact"]:
                role_modifier = temporal_weight
        
        # Apply era modifier if available
        era = evaluation.get("game_era", "Progression")  # Default to mid-game
        era_modifier = self.era_modifiers.get(era, 1.0)
        
        # Check for consecutive similar actions
        consecutive_modifier = await self._calculate_consecutive_modifier(player_id, decision, base_karma)
        
        # Calculate final karma impact
        karma_impact = base_karma * role_modifier * era_modifier * consecutive_modifier
        
        # Round to nearest integer
        karma_impact = round(karma_impact)
        
        # Ensure within bounds (-10 to +10)
        karma_impact = max(-10, min(10, karma_impact))
        
        # Update player action history
        await self._update_action_history(player_id, decision, karma_impact)
        
        return karma_impact
    
    async def calculate_total(self, player_id: str, actions: list) -> int:
        """
        Calculate total karma impact for a series of actions.
        
        Args:
            player_id: The ID of the player
            actions: List of action dictionaries with decision and evaluation
            
        Returns:
            The total calculated karma impact
        """
        total_karma = 0
        
        for action in actions:
            decision = action.get("decision", "")
            evaluation = action.get("evaluation", {})
            
            karma = await self.calculate(player_id, decision, evaluation)
            total_karma += karma
        
        return total_karma
    
    async def _calculate_consecutive_modifier(self, player_id: str, decision: str, base_karma: int) -> float:
        """
        Calculate modifier for consecutive similar actions.
        Repeated similar actions have diminishing karma returns.
        
        Args:
            player_id: The ID of the player
            decision: The decision text
            base_karma: The base karma score
            
        Returns:
            A modifier for consecutive similar actions
        """
        # Get player's action history
        history = self.player_action_history.get(player_id, [])
        
        if not history:
            return 1.0
        
        # Determine the category of the current action
        current_category = self._categorize_action(decision, base_karma)
        
        # Count consecutive actions of the same category
        consecutive_count = 0
        for past_action in reversed(history[-5:]):  # Look at last 5 actions
            past_category = past_action.get("category", None)
            if past_category == current_category:
                consecutive_count += 1
            else:
                break
        
        # Calculate diminishing returns
        if consecutive_count > 0:
            return 1.0 / (1.0 + (consecutive_count * 0.2))  # Each consecutive action reduces impact by 20%
        
        return 1.0
    
    async def _update_action_history(self, player_id: str, decision: str, karma_impact: int) -> None:
        """
        Update a player's action history.
        
        Args:
            player_id: The ID of the player
            decision: The decision text
            karma_impact: The calculated karma impact
        """
        if player_id not in self.player_action_history:
            self.player_action_history[player_id] = []
        
        category = self._categorize_action(decision, karma_impact)
        
        self.player_action_history[player_id].append({
            "decision": decision,
            "karma_impact": karma_impact,
            "category": category
        })
        
        # Keep history limited to last 20 actions
        if len(self.player_action_history[player_id]) > 20:
            self.player_action_history[player_id] = self.player_action_history[player_id][-20:]
    
    def _categorize_action(self, decision: str, karma_impact: int) -> str:
        """
        Categorize an action based on its decision text and karma impact.
        
        Args:
            decision: The decision text
            karma_impact: The karma impact
            
        Returns:
            The category of the action
        """
        decision_lower = decision.lower()
        
        # Check if the decision contains any keywords from the categories
        for category, keywords in self.action_categories.items():
            if any(keyword in decision_lower for keyword in keywords):
                return category
        
        # If no keywords match, categorize based on karma impact
        if karma_impact > 3:
            return "ethical_positive"
        elif karma_impact < -3:
            return "ethical_negative"
        elif 0 < karma_impact <= 3:
            return "tech_positive"
        elif -3 <= karma_impact < 0:
            return "tech_negative"
        else:
            return "neutral"
