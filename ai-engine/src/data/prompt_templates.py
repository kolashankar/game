"""
Prompt Templates
Contains templates for various AI prompts used in the ChronoCore game.
"""

from typing import Dict, Any, List
import json
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PromptTemplates:
    """
    Manages prompt templates for the ChronoCore AI engine.
    Templates are used for consistent AI-generated content across the game.
    """
    
    # Story generation templates
    STORY_GENERATION = {
        "world_description": """
        You are the AI storyteller for ChronoCore: Path of Realities, a board game about time, ethics, and technology.
        
        Current Game State:
        {game_state}
        
        Current Era: {current_era}
        
        Recent Events:
        {recent_events}
        
        Based on this information, generate a compelling narrative paragraph that describes the current state of the game world.
        Focus on the consequences of player actions, the state of different timelines, and the ethical implications of recent events.
        The tone should be philosophical and thought-provoking, with elements of both hope and concern for the future.
        """,
        
        "quest_creation": """
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
        """,
        
        "ethical_dilemma": """
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
        
        The dilemma should reflect the technology level and cultural context of the realm.
        Focus on creating a situation where there is no clear "right" answer, but different approaches with different consequences.
        """
    }
    
    # Decision evaluation templates
    DECISION_EVALUATION = {
        "ethical_analysis": """
        You are the ethical AI evaluator for ChronoCore: Path of Realities, a board game about time, ethics, and technology.
        
        Player Role: {player_role}
        
        Decision: {decision}
        
        Context: {context}
        
        Evaluate this decision from multiple perspectives:
        1. Ethical Impact: Is this decision morally sound? Does it prioritize the greater good or personal gain?
        2. Technological Impact: How does this decision affect technological development? Is it sustainable?
        3. Temporal Impact: What are the long-term consequences of this decision? Does it create stability or chaos?
        
        Provide a balanced evaluation that considers the player's role and the specific context.
        Include a karma score impact between -10 and +10, where:
        - Negative scores (-10 to -1) indicate selfish or destructive choices
        - Neutral scores (0) indicate balanced or neutral choices
        - Positive scores (+1 to +10) indicate selfless or constructive choices
        
        Format your response as a structured evaluation with clear sections and a final karma score.
        """,
        
        "timeline_impact": """
        You are analyzing the impact of a decision on the timeline stability in ChronoCore.
        
        Decision: {decision}
        
        Current Timeline State:
        {timeline_state}
        
        Evaluate how this decision affects timeline stability:
        1. Does it create new branches or paradoxes?
        2. Does it resolve existing timeline conflicts?
        3. How does it affect the overall coherence of the multiverse?
        
        Provide a stability impact score between -5 (highly destabilizing) and +5 (highly stabilizing).
        Explain your reasoning for the score.
        """
    }
    
    # Realm development templates
    REALM_DEVELOPMENT = {
        "technological_advancement": """
        You are determining technological advancements for a realm in ChronoCore.
        
        Realm Information:
        {realm}
        
        Current Technology Level: {tech_level}
        
        Recent Decisions:
        {decisions}
        
        Based on the recent decisions and current state of the realm, determine:
        1. What new technology has been developed?
        2. How does this technology change the realm's society?
        3. What new capabilities does this provide to the controlling player?
        
        The advancement should be logical given the realm's current technology level and the decisions made.
        """,
        
        "cultural_evolution": """
        You are determining cultural changes for a realm in ChronoCore.
        
        Realm Information:
        {realm}
        
        Current Cultural Values:
        {cultural_values}
        
        Recent Events:
        {events}
        
        Based on the recent events and current cultural values, determine:
        1. How have the realm's cultural values shifted?
        2. What new social structures or norms have emerged?
        3. How do these changes affect the realm's relationship with other realms?
        
        The cultural evolution should reflect the impact of recent events and technological changes.
        """
    }
    
    # Time anomaly templates
    TIME_ANOMALIES = {
        "rift_generation": """
        You are creating a time rift anomaly for ChronoCore.
        
        Current Game State:
        {game_state}
        
        Recent Timeline Disturbances:
        {disturbances}
        
        Generate a time rift with the following elements:
        1. A description of the anomaly's physical manifestation
        2. The effects on nearby realms and timelines
        3. The potential consequences if left unresolved
        4. 2-3 possible approaches to resolving the rift
        
        The time rift should be thematically connected to recent player actions and timeline disturbances.
        """,
        
        "paradox_resolution": """
        You are determining the resolution of a temporal paradox in ChronoCore.
        
        Paradox Description:
        {paradox}
        
        Player's Approach:
        {approach}
        
        Determine the outcome of the player's attempt to resolve the paradox:
        1. Was the paradox successfully resolved? If so, how?
        2. What are the immediate effects on the timeline?
        3. What are the long-term consequences of this resolution?
        4. Are there any unexpected side effects?
        
        The resolution should be logical given the nature of the paradox and the player's approach.
        """
    }
    
    @classmethod
    def get_template(cls, category: str, template_name: str) -> str:
        """
        Get a prompt template by category and name.
        
        Args:
            category: Category of the template (e.g., STORY_GENERATION)
            template_name: Name of the specific template
            
        Returns:
            The template string or empty string if not found
        """
        try:
            return cls.__dict__[category][template_name]
        except (KeyError, TypeError):
            logger.error(f"Template not found: {category}.{template_name}")
            return ""
    
    @classmethod
    def format_template(cls, category: str, template_name: str, **kwargs) -> str:
        """
        Format a template with the provided variables.
        
        Args:
            category: Category of the template
            template_name: Name of the specific template
            **kwargs: Variables to insert into the template
            
        Returns:
            The formatted template string
        """
        template = cls.get_template(category, template_name)
        
        if not template:
            return ""
        
        try:
            return template.format(**kwargs)
        except KeyError as e:
            logger.error(f"Missing variable in template formatting: {e}")
            return template
        except Exception as e:
            logger.error(f"Error formatting template: {e}")
            return template
