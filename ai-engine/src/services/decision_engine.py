"""
Decision Engine Service
Evaluates player decisions and their impact on the game world.
"""

import os
import random
from typing import List, Dict, Optional
import asyncio

from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

from ..models.player import Player
from ..utils.config import Config


class DecisionEngine:
    """
    Service for evaluating player decisions and their impact on the game world.
    Uses LangChain and OpenAI to analyze decisions from ethical, technological, and temporal perspectives.
    """
    
    def __init__(self):
        """Initialize the decision engine with LangChain components."""
        # Initialize OpenAI Chat model
        self.llm = ChatOpenAI(
            temperature=0.5,  # Lower temperature for more consistent evaluations
            max_tokens=Config.OPENAI_MAX_TOKENS,
            model_name=Config.OPENAI_MODEL,
            openai_api_key=Config.OPENAI_API_KEY
        )
        
        # Initialize prompt templates
        self.decision_prompt = PromptTemplate(
            input_variables=["player_role", "decision", "context"],
            template="""
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
            """
        )
        
        # Initialize LLM chain
        self.decision_chain = LLMChain(llm=self.llm, prompt=self.decision_prompt)
    
    async def evaluate(self, player_id: str, decision: str, context: dict) -> Dict:
        """
        Evaluate a player's decision and its impact on the game world.
        
        Args:
            player_id: The ID of the player making the decision
            decision: The decision text
            context: Additional context about the decision
            
        Returns:
            A dictionary containing the evaluation results
        """
        # Get player role from context or use a default
        player_role = context.get("player_role", "Unknown Role")
        
        # Convert context to string format for the prompt
        context_str = "\n".join([f"{key}: {value}" for key, value in context.items()])
        
        # Generate evaluation
        evaluation_text = await asyncio.to_thread(
            self.decision_chain.run,
            player_role=player_role,
            decision=decision,
            context=context_str
        )
        
        # Parse the evaluation text
        lines = evaluation_text.strip().split("\n")
        
        ethical_impact = ""
        technological_impact = ""
        temporal_impact = ""
        karma_score = 0
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if "ethical impact" in line.lower():
                current_section = "ethical"
                ethical_impact = line.split(":", 1)[1].strip() if ":" in line else ""
            elif "technological impact" in line.lower():
                current_section = "technological"
                technological_impact = line.split(":", 1)[1].strip() if ":" in line else ""
            elif "temporal impact" in line.lower():
                current_section = "temporal"
                temporal_impact = line.split(":", 1)[1].strip() if ":" in line else ""
            elif "karma score" in line.lower() or "karma impact" in line.lower():
                try:
                    # Extract the karma score
                    if "+" in line:
                        karma_score = int(line.split("+")[1].split()[0])
                    elif "-" in line:
                        karma_score = -int(line.split("-")[1].split()[0])
                    else:
                        for word in line.split():
                            if word.isdigit() or (word[0] == '-' and word[1:].isdigit()):
                                karma_score = int(word)
                                break
                except:
                    # Default to a random small karma impact if parsing fails
                    karma_score = random.randint(-3, 3)
            elif current_section == "ethical":
                ethical_impact += " " + line
            elif current_section == "technological":
                technological_impact += " " + line
            elif current_section == "temporal":
                temporal_impact += " " + line
        
        # Ensure karma score is within bounds
        karma_score = max(-10, min(10, karma_score))
        
        # Create and return the evaluation result
        evaluation = {
            "ethical_impact": ethical_impact.strip(),
            "technological_impact": technological_impact.strip(),
            "temporal_impact": temporal_impact.strip(),
            "karma_score": karma_score,
            "summary": self._generate_summary(ethical_impact, technological_impact, temporal_impact, karma_score)
        }
        
        return evaluation
    
    def _generate_summary(self, ethical_impact: str, technological_impact: str, 
                          temporal_impact: str, karma_score: int) -> str:
        """
        Generate a summary of the evaluation.
        
        Args:
            ethical_impact: The ethical impact text
            technological_impact: The technological impact text
            temporal_impact: The temporal impact text
            karma_score: The karma score
            
        Returns:
            A summary of the evaluation
        """
        if karma_score >= 7:
            return "This decision shows exceptional wisdom and foresight, benefiting many across multiple timelines."
        elif karma_score >= 4:
            return "This decision is ethically sound and contributes positively to the stability of the timelines."
        elif karma_score >= 1:
            return "This decision has a slightly positive impact, though its long-term effects may be limited."
        elif karma_score >= -1:
            return "This decision is relatively neutral, neither significantly helping nor harming the timelines."
        elif karma_score >= -4:
            return "This decision has some negative consequences that may destabilize affected timelines."
        elif karma_score >= -7:
            return "This decision has serious ethical concerns and could cause significant harm across timelines."
        else:
            return "This decision is catastrophic, with far-reaching negative consequences that may be irreversible."
