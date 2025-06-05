"""
Training Data
Manages training data for fine-tuning and improving AI models.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TrainingData:
    """
    Manages training data for the ChronoCore AI engine.
    Provides methods for loading, filtering, and accessing training examples.
    """
    
    def __init__(self, data_dir: str = None):
        """
        Initialize the training data manager.
        
        Args:
            data_dir: Directory containing training data files (defaults to src/data/training)
        """
        self.data_dir = data_dir or os.path.join(os.path.dirname(__file__), "training")
        self.examples = {
            "story_generation": [],
            "quest_creation": [],
            "ethical_dilemmas": [],
            "decision_evaluation": [],
            "timeline_impacts": [],
            "realm_development": [],
            "time_anomalies": []
        }
        self._load_examples()
    
    def _load_examples(self) -> None:
        """Load training examples from data files."""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir, exist_ok=True)
            logger.warning(f"Created training data directory: {self.data_dir}")
            self._create_sample_data()
            return
        
        for category in self.examples.keys():
            file_path = os.path.join(self.data_dir, f"{category}.json")
            
            if not os.path.exists(file_path):
                logger.warning(f"Training data file not found: {file_path}")
                continue
            
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    self.examples[category] = data
                    logger.info(f"Loaded {len(data)} examples for {category}")
            except Exception as e:
                logger.error(f"Error loading training data from {file_path}: {e}")
    
    def _create_sample_data(self) -> None:
        """Create sample training data files if none exist."""
        # Sample story generation examples
        story_examples = [
            {
                "input": {
                    "game_state": "The world is divided into three major timelines, each with its own technological development path.",
                    "current_era": "Progression",
                    "recent_events": "A temporal anomaly has appeared in the Technocratic Union realm."
                },
                "output": "As the Progression Era unfolds, the three divergent timelines continue to evolve along distinct technological trajectories. The Harmony Collective embraces sustainable bio-integration, while the Technocratic Union pushes the boundaries of artificial intelligence, and the Nomadic Confederacy masters quantum transportation. However, a shimmering temporal anomaly has manifested within the Technocratic Union's central metropolis, causing sporadic fluctuations in their AI networks. This disturbance ripples across timeline boundaries, subtly influencing the development paths of all three societies. The Architects of Reality now face a critical juncture: will they contain this anomaly, exploit its potential, or allow it to catalyze unpredictable evolution across all timelines?"
            },
            {
                "input": {
                    "game_state": "Five players are competing to shape the future of humanity across multiple timelines.",
                    "current_era": "Distortion",
                    "recent_events": "Player 3 has created a paradox by altering a key historical event."
                },
                "output": "The fabric of reality strains as the Distortion Era intensifies. The five Architects' manipulations have created a complex web of causality across multiple timelines. Most significantly, the recent intervention by the Shadow Broker has created a severe paradox by preventing the Great Technological Convergence of 2157—an event that was supposed to unify three divergent technological paths. This paradox has caused timeline Alpha-7 to split into three unstable branches, each exhibiting increasingly erratic physical laws. Civilizations within these branches report strange phenomena: reversed gravity wells, technology that functions only during specific temporal phases, and individuals who exist simultaneously across multiple points in time. As reality continues to fracture, the other Architects must decide whether to stabilize these distortions, exploit them for power, or allow them to potentially collapse entire timelines into the void."
            }
        ]
        
        # Sample quest creation examples
        quest_examples = [
            {
                "input": {
                    "player": "Alex",
                    "player_role": "Techno Monk",
                    "karma": 5,
                    "owned_realms": ["Harmony Enclave", "Digital Nexus"],
                    "timeline": "Timeline Alpha is focused on technological advancement with strong ethical oversight.",
                    "game_state": "The world is experiencing increasing temporal instability."
                },
                "output": {
                    "title": "The Quantum Conscience Dilemma",
                    "description": "Your Digital Nexus realm has developed a quantum AI capable of predicting timeline collapses with 98% accuracy. However, the AI has determined that to prevent a catastrophic collapse affecting multiple realms, it must be granted access to monitor the thoughts of all citizens across your realms. As a Techno Monk, you must decide how to proceed with this powerful but invasive technology.",
                    "options": [
                        {
                            "text": "Implement the full monitoring system, ensuring timeline stability at the cost of privacy.",
                            "karma_impact": -3,
                            "outcome": "Timeline stability increases by 40%, but your citizens grow resentful of the constant surveillance, and neighboring realms become suspicious of your intentions."
                        },
                        {
                            "text": "Modify the AI to use anonymous data patterns instead of direct thought monitoring.",
                            "karma_impact": 2,
                            "outcome": "Timeline stability increases by 25%, preserving most privacy. Your technological innovation earns respect from other Techno Monks."
                        },
                        {
                            "text": "Reject the AI's recommendation and instead focus on strengthening natural timeline resilience through meditation techniques.",
                            "karma_impact": 4,
                            "outcome": "Timeline stability increases by only 10% initially, but your realms develop a unique harmony with temporal energies that grows stronger over time."
                        },
                        {
                            "text": "Share the AI technology with all players, allowing for a democratic decision on its implementation.",
                            "karma_impact": 5,
                            "outcome": "Timeline stability varies based on collective decisions, but your act of transparency significantly improves diplomatic relations with all players."
                        }
                    ]
                }
            }
        ]
        
        # Create sample files
        self.examples["story_generation"] = story_examples
        self.examples["quest_creation"] = quest_examples
        
        # Save sample files
        for category, examples in self.examples.items():
            if examples:
                file_path = os.path.join(self.data_dir, f"{category}.json")
                try:
                    with open(file_path, 'w') as f:
                        json.dump(examples, f, indent=2)
                    logger.info(f"Created sample data file: {file_path}")
                except Exception as e:
                    logger.error(f"Error creating sample data file {file_path}: {e}")
    
    def get_examples(self, category: str, count: int = 5) -> List[Dict]:
        """
        Get training examples for a specific category.
        
        Args:
            category: Category of examples to retrieve
            count: Number of examples to return (default: 5)
            
        Returns:
            List of training examples
        """
        if category not in self.examples:
            logger.error(f"Unknown category: {category}")
            return []
        
        examples = self.examples.get(category, [])
        
        if not examples:
            logger.warning(f"No examples found for category: {category}")
            return []
        
        # Return random subset if we have more examples than requested
        if len(examples) > count:
            return random.sample(examples, count)
        
        return examples
    
    def add_example(self, category: str, input_data: Dict, output_data: Any) -> bool:
        """
        Add a new training example.
        
        Args:
            category: Category for the example
            input_data: Input data for the example
            output_data: Output/target data for the example
            
        Returns:
            True if successful, False otherwise
        """
        if category not in self.examples:
            logger.error(f"Unknown category: {category}")
            return False
        
        try:
            example = {
                "input": input_data,
                "output": output_data
            }
            
            self.examples[category].append(example)
            
            # Save updated examples to file
            file_path = os.path.join(self.data_dir, f"{category}.json")
            with open(file_path, 'w') as f:
                json.dump(self.examples[category], f, indent=2)
            
            logger.info(f"Added new example to {category}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding example to {category}: {e}")
            return False
    
    def get_few_shot_examples(self, category: str, count: int = 3) -> str:
        """
        Get few-shot learning examples formatted as a string for prompts.
        
        Args:
            category: Category of examples to retrieve
            count: Number of examples to include
            
        Returns:
            Formatted string of examples for few-shot learning
        """
        examples = self.get_examples(category, count)
        
        if not examples:
            return ""
        
        formatted = "Here are some examples:\n\n"
        
        for i, example in enumerate(examples):
            formatted += f"Example {i+1}:\n"
            formatted += f"Input: {json.dumps(example['input'], indent=2)}\n"
            formatted += f"Output: {json.dumps(example['output'], indent=2)}\n\n"
        
        return formatted
