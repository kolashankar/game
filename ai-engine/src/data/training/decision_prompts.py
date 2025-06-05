"""
Decision Prompts Module
Contains templates for generating decision evaluations and consequences
"""

from typing import Dict, Any

# Decision evaluation prompt template
DECISION_EVALUATION_TEMPLATE = """
You are the AI engine for ChronoCore: Path of Realities, a game about time manipulation and ethical choices.
Your task is to evaluate a player's decision and generate its impact on the game world.

## Player Information
- Player ID: {player_id}
- Player Role: {player_role}
- Current Karma: {player_karma}

## Game Context
- Current Era: {current_era}
- Current Turn: {current_turn}
- Timeline Stability: {timeline_stability}%

## Decision Context
{context}

## Player's Decision
{decision}

## Evaluation Instructions
1. Analyze the ethical implications of this decision
2. Determine technological impact on affected realms
3. Calculate temporal consequences on timeline stability
4. Assign a karma value between -10 and +10 based on the decision's alignment with ethical principles
5. Generate a detailed explanation of all impacts

## Response Format
Provide your evaluation in the following JSON format:
```
{
  "ethical_impact": "Detailed explanation of ethical implications",
  "technological_impact": "Explanation of how this affects technology in relevant realms",
  "temporal_impact": "Description of timeline stability effects",
  "karma_impact": integer_between_minus_10_and_plus_10,
  "affected_realms": ["list", "of", "realm_ids"],
  "affected_timelines": ["list", "of", "timeline_ids"],
  "explanation": "Overall explanation of decision consequences"
}
```

Remember to maintain consistency with the game's lore and previous events.
"""

# Quest generation prompt template
QUEST_GENERATION_TEMPLATE = """
You are the AI engine for ChronoCore: Path of Realities, a game about time manipulation and ethical choices.
Your task is to generate a meaningful quest for a player based on their role and the current game state.

## Player Information
- Player ID: {player_id}
- Player Role: {player_role}
- Current Karma: {player_karma}
- Controlled Realms: {player_realms}

## Game Context
- Current Era: {current_era}
- Current Turn: {current_turn}
- Timeline Stability: {timeline_stability}%
- Recent Events: {recent_events}

## Quest Generation Instructions
1. Create a quest appropriate for the player's role and current game state
2. Include ethical dilemmas that challenge the player
3. Provide 2-4 distinct options for resolving the quest
4. Ensure the quest has meaningful consequences for the game world
5. Set an appropriate difficulty level (1-5) based on the current era and player experience

## Response Format
Provide your quest in the following JSON format:
```
{
  "title": "Quest Title",
  "description": "Detailed quest description including background and objectives",
  "type": "Ethical|Technical|Diplomatic|Temporal|General",
  "difficulty": integer_between_1_and_5,
  "options": [
    {
      "id": 1,
      "text": "Option 1 description",
      "potential_outcome": "Brief hint about consequences"
    },
    {
      "id": 2,
      "text": "Option 2 description",
      "potential_outcome": "Brief hint about consequences"
    }
    // Additional options as needed
  ]
}
```

Make the quest engaging, challenging, and relevant to the current game state.
"""

# Time rift generation prompt template
TIME_RIFT_GENERATION_TEMPLATE = """
You are the AI engine for ChronoCore: Path of Realities, a game about time manipulation and ethical choices.
Your task is to generate a time rift (anomaly) in a timeline based on the current game state.

## Timeline Information
- Timeline ID: {timeline_id}
- Timeline Name: {timeline_name}
- Current Stability: {timeline_stability}%
- Realms in Timeline: {timeline_realms}

## Game Context
- Current Era: {current_era}
- Current Turn: {current_turn}
- Recent Events: {recent_events}

## Time Rift Generation Instructions
1. Create a time rift with severity proportional to timeline instability (1-5)
2. Describe the anomaly and its visible effects on the timeline
3. Define potential consequences if left unresolved
4. Suggest possible approaches to resolve the rift
5. Determine which realms are most affected

## Response Format
Provide your time rift in the following JSON format:
```
{
  "description": "Detailed description of the time rift and its visible effects",
  "severity": integer_between_1_and_5,
  "potential_consequences": "What might happen if the rift remains unresolved",
  "resolution_approaches": ["Approach 1", "Approach 2", "Approach 3"],
  "affected_realms": ["list", "of", "realm_ids"],
  "coordinates": {"x": float_coordinate, "y": float_coordinate},
  "effects": {
    "stability_impact": integer_stability_change,
    "technological_impact": "Description of technological effects",
    "ecological_impact": "Description of ecological effects"
  }
}
```

Make the time rift interesting, challenging, and appropriate for the current game state.
"""

def get_decision_evaluation_prompt(player_data: Dict[str, Any], game_data: Dict[str, Any], 
                                 decision: str, context: Dict[str, Any]) -> str:
    """
    Generate a decision evaluation prompt
    
    Args:
        player_data: Player information
        game_data: Game state information
        decision: Player's decision text
        context: Decision context
        
    Returns:
        Formatted prompt string
    """
    context_str = "\n".join([f"- {k}: {v}" for k, v in context.items()])
    
    return DECISION_EVALUATION_TEMPLATE.format(
        player_id=player_data.get("id", "unknown"),
        player_role=player_data.get("role", "unknown"),
        player_karma=player_data.get("karma", 0),
        current_era=game_data.get("current_era", "Initiation"),
        current_turn=game_data.get("current_turn", 1),
        timeline_stability=game_data.get("timeline_stability", 100),
        context=context_str,
        decision=decision
    )

def get_quest_generation_prompt(player_data: Dict[str, Any], game_data: Dict[str, Any]) -> str:
    """
    Generate a quest generation prompt
    
    Args:
        player_data: Player information
        game_data: Game state information
        
    Returns:
        Formatted prompt string
    """
    player_realms = ", ".join([r.get("name", "Unknown Realm") for r in player_data.get("realms", [])])
    recent_events = "\n".join([f"- {e.get('description', '')}" for e in game_data.get("recent_events", [])])
    
    return QUEST_GENERATION_TEMPLATE.format(
        player_id=player_data.get("id", "unknown"),
        player_role=player_data.get("role", "unknown"),
        player_karma=player_data.get("karma", 0),
        player_realms=player_realms or "None",
        current_era=game_data.get("current_era", "Initiation"),
        current_turn=game_data.get("current_turn", 1),
        timeline_stability=game_data.get("timeline_stability", 100),
        recent_events=recent_events or "No recent events"
    )

def get_time_rift_generation_prompt(timeline_data: Dict[str, Any], game_data: Dict[str, Any]) -> str:
    """
    Generate a time rift generation prompt
    
    Args:
        timeline_data: Timeline information
        game_data: Game state information
        
    Returns:
        Formatted prompt string
    """
    timeline_realms = ", ".join([r.get("name", "Unknown Realm") for r in timeline_data.get("realms", [])])
    recent_events = "\n".join([f"- {e.get('description', '')}" for e in game_data.get("recent_events", [])])
    
    return TIME_RIFT_GENERATION_TEMPLATE.format(
        timeline_id=timeline_data.get("id", "unknown"),
        timeline_name=timeline_data.get("name", "Unknown Timeline"),
        timeline_stability=timeline_data.get("stability", 100),
        timeline_realms=timeline_realms or "None",
        current_era=game_data.get("current_era", "Initiation"),
        current_turn=game_data.get("current_turn", 1),
        recent_events=recent_events or "No recent events"
    )
