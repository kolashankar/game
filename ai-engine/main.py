"""
ChronoCore AI Engine - Main Entry Point
This module serves as the main entry point for the AI engine that powers
the ChronoCore game's AI-driven storytelling and decision-making.
"""

import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Dict, List, Optional

from src.models.game_state import GameState
from src.models.player import Player
from src.models.quest import Quest
from src.models.realm import Realm
from src.models.timeline import Timeline

from src.services.story_generator import StoryGenerator
from src.services.decision_engine import DecisionEngine
from src.services.karma_calculator import KarmaCalculator
from src.services.timeline_analyzer import TimelineAnalyzer
from src.services.realm_manager import RealmManager

from src.data.embeddings_store import EmbeddingsStore
from src.data.prompt_templates import PromptTemplates
from src.data.training_data import TrainingData
from src.data.game_data import GameData

from src.utils.database import init_db
from src.utils.embeddings import init_embeddings
from src.utils.config import Config

# Load environment variables
load_dotenv()

# Define lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database connections and other resources on startup
    await init_db()
    await init_embeddings()
    
    # Log startup information
    print(f"ChronoCore AI Engine starting with OpenAI model: {Config.OPENAI_MODEL}")
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    
    yield
    
    # Clean up resources on shutdown if needed
    print("ChronoCore AI Engine shutting down")

# Initialize FastAPI app
app = FastAPI(
    title="ChronoCore AI Engine",
    description="AI Engine for ChronoCore: Path of Realities board game",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
story_generator = StoryGenerator()
decision_engine = DecisionEngine()
karma_calculator = KarmaCalculator()
timeline_analyzer = TimelineAnalyzer()
realm_manager = RealmManager()

# Initialize data components
embeddings_store = EmbeddingsStore()
game_data = GameData()
training_data = TrainingData()

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {
        "message": "ChronoCore AI Engine is running",
        "version": "1.0.0",
        "openai_model": Config.OPENAI_MODEL,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Story generation endpoints
@app.post("/generate-story")
async def generate_story(game_state: GameState):
    """Generate a story based on the current game state."""
    try:
        story = await story_generator.generate(game_state)
        return {"story": story}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-quest")
async def generate_quest(player: Player, game_state: GameState):
    """Generate a quest for a specific player based on their actions and game state."""
    try:
        quest = await story_generator.generate_quest(player, game_state)
        return {"quest": quest}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-ethical-dilemma")
async def generate_ethical_dilemma(realm_id: str, game_state: GameState):
    """Generate an ethical dilemma for a specific realm."""
    try:
        dilemma = await story_generator.generate_ethical_dilemma(realm_id, game_state)
        return {"dilemma": dilemma}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Decision and karma endpoints
@app.post("/evaluate-decision")
async def evaluate_decision(
    player_id: str = Body(...), 
    decision: str = Body(...), 
    context: dict = Body(...)
):
    """Evaluate a player's decision and calculate karma impact."""
    try:
        evaluation = await decision_engine.evaluate(player_id, decision, context)
        karma_impact = await karma_calculator.calculate(player_id, decision, evaluation)
        
        # Store the decision and evaluation for future reference
        await game_data.save_player_decision(player_id, {
            "decision": decision,
            "evaluation": evaluation,
            "karma_impact": karma_impact,
            "context": context
        })
        
        return {
            "evaluation": evaluation,
            "karma_impact": karma_impact
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/calculate-karma")
async def calculate_karma(player_id: str = Body(...), actions: list = Body(...)):
    """Calculate karma based on a player's actions."""
    try:
        karma = await karma_calculator.calculate_total(player_id, actions)
        return {"karma": karma}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Timeline analysis endpoints
@app.post("/analyze-timeline")
async def analyze_timeline(timeline_id: str = Body(...), game_state: GameState = Body(...)):
    """Analyze a timeline and return detailed information about its state."""
    try:
        analysis = await timeline_analyzer.analyze_timeline(timeline_id, game_state)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-paradoxes")
async def detect_paradoxes(
    timeline_id: str = Body(...), 
    game_state: GameState = Body(...)
):
    """Detect potential paradoxes in a timeline."""
    try:
        # Find the timeline
        timeline = None
        for t in game_state.timelines:
            if t.timeline_id == timeline_id:
                timeline = t
                break
        
        if timeline is None:
            raise HTTPException(status_code=404, detail=f"Timeline with ID {timeline_id} not found")
        
        # Get realms in this timeline
        realms = [r for r in game_state.realms if r.timeline_id == timeline_id]
        
        paradoxes = await timeline_analyzer.detect_paradoxes(timeline, realms, game_state)
        return {"paradoxes": paradoxes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-time-rift")
async def generate_time_rift(game_state: GameState):
    """Generate a time rift based on the current game state."""
    try:
        time_rift = await timeline_analyzer.generate_time_rift(game_state)
        if time_rift:
            return {"time_rift": time_rift}
        else:
            return {"message": "No time rift generated at this time"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Realm management endpoints
@app.post("/update-realm")
async def update_realm(realm: Realm = Body(...), game_state: GameState = Body(...)):
    """Update a realm based on current game state and player decisions."""
    try:
        updated_realm = await realm_manager.update_realm(realm, game_state)
        return {"realm": updated_realm}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-realm-event")
async def process_realm_event(
    realm: Realm = Body(...),
    event_type: str = Body(...),
    event_data: dict = Body(...),
    game_state: GameState = Body(...)
):
    """Process a specific event affecting a realm."""
    try:
        updated_realm, outcome = await realm_manager.process_realm_event(
            realm, event_type, event_data, game_state
        )
        return {
            "realm": updated_realm,
            "outcome": outcome
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-realm-event")
async def generate_realm_event(realm: Realm = Body(...), game_state: GameState = Body(...)):
    """Generate a random event for a realm based on its current state."""
    try:
        event = await realm_manager.generate_realm_event(realm, game_state)
        if event:
            return {"event": event}
        else:
            return {"message": "No event generated at this time"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Game data management endpoints
@app.get("/game/{game_id}")
async def get_game(game_id: str):
    """Get a game state by ID."""
    try:
        game_state = await game_data.get_game(game_id)
        if game_state:
            return {"game_state": game_state}
        else:
            raise HTTPException(status_code=404, detail=f"Game with ID {game_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/game")
async def save_game(game_state: GameState):
    """Save a game state."""
    try:
        success = await game_data.save_game(game_state)
        if success:
            return {"message": f"Game {game_state.game_id} saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save game state")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/game/new")
async def create_new_game(players: List[Dict] = Body(...), settings: Dict = Body(None)):
    """Create a new game with the specified players and settings."""
    try:
        game_state = await game_data.create_new_game(players, settings)
        if game_state:
            return {"game_state": game_state}
        else:
            raise HTTPException(status_code=500, detail="Failed to create new game")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/player/{player_id}")
async def get_player(player_id: str):
    """Get a player by ID."""
    try:
        player = await game_data.get_player(player_id)
        if player:
            return {"player": player}
        else:
            raise HTTPException(status_code=404, detail=f"Player with ID {player_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/player/{player_id}/quests")
async def get_player_quests(player_id: str):
    """Get all quests for a player."""
    try:
        quests = await game_data.get_player_quests(player_id)
        return {"quests": quests}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/player/{player_id}/decisions")
async def get_player_decisions(player_id: str, limit: int = 10):
    """Get recent decisions for a player."""
    try:
        decisions = await game_data.get_player_decisions(player_id, limit)
        return {"decisions": decisions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Semantic search endpoints
@app.post("/search/similar-contexts")
async def find_similar_contexts(query: str = Body(...), top_k: int = Body(5)):
    """Find game contexts similar to the query."""
    try:
        results = await embeddings_store.find_similar(query, top_k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search/compare-texts")
async def compare_texts(text_a: str = Body(...), text_b: str = Body(...)):
    """Compare two texts and return their similarity score."""
    try:
        similarity = await embeddings_store.compare_texts(text_a, text_b)
        return {"similarity": similarity}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Prompt template endpoints
@app.get("/prompts/categories")
async def get_prompt_categories():
    """Get available prompt template categories."""
    try:
        categories = [cat for cat in dir(PromptTemplates) if cat.isupper()]
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prompts/{category}")
async def get_prompt_templates(category: str):
    """Get prompt templates for a specific category."""
    try:
        if hasattr(PromptTemplates, category) and category.isupper():
            templates = getattr(PromptTemplates, category)
            return {"templates": templates}
        else:
            raise HTTPException(status_code=404, detail=f"Category {category} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Training data endpoints
@app.get("/training/{category}")
async def get_training_examples(category: str, count: int = 5):
    """Get training examples for a specific category."""
    try:
        examples = training_data.get_examples(category, count)
        return {"examples": examples}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/training/{category}")
async def add_training_example(
    category: str, 
    input_data: Dict = Body(...), 
    output_data: Dict = Body(...)
):
    """Add a new training example."""
    try:
        success = training_data.add_example(category, input_data, output_data)
        if success:
            return {"message": f"Example added to {category} successfully"}
        else:
            raise HTTPException(status_code=500, detail=f"Failed to add example to {category}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.getenv("PORT", 8000))
    
    # Run the FastAPI app with uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 