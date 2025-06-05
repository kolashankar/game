# ChronoCore Backend

Backend server for the ChronoCore: Path of Realities game, providing API endpoints, real-time communication, and integration with the AI engine.

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Socket.IO**: Real-time communication
- **PostgreSQL**: Primary database for user accounts and game metadata
- **MongoDB**: NoSQL database for game state and events
- **Sequelize**: ORM for PostgreSQL
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- MongoDB
- Python 3.10+ (for AI Engine)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/chronocore.git
   cd chronocore/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

4. Start the development server:
   ```
   npm run dev
   ```

### Database Setup

The application will automatically create the necessary tables in PostgreSQL on startup in development mode. Make sure your PostgreSQL server is running and accessible with the credentials in your `.env` file.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── socket/         # Socket.IO handlers
│   ├── utils/          # Utility functions
│   └── index.js        # Entry point
├── .env                # Environment variables
├── .env.example        # Example environment variables
└── package.json        # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Games
- `GET /api/games` - Get all games for the current user
- `POST /api/games` - Create a new game
- `GET /api/games/:id` - Get a specific game
- `PUT /api/games/:id` - Update a game
- `DELETE /api/games/:id` - Delete a game
- `POST /api/games/:id/join` - Join a game with a code

### Players
- `GET /api/players/:id` - Get player details
- `PUT /api/players/:id` - Update player details
- `GET /api/players/:id/quests` - Get player quests

### AI Integration
- `POST /api/ai/generate-story` - Generate a story based on game state
- `POST /api/ai/generate-quest` - Generate a quest for a player
- `POST /api/ai/evaluate-decision` - Evaluate a player's decision

## Socket.IO Events

### Connection
- `connection` - Client connected
- `disconnect` - Client disconnected

### Game Events
- `join_game` - Join a game room
- `leave_game` - Leave a game room
- `game_update` - Game state updated
- `player_action` - Player performed an action
- `chat_message` - Chat message in a game

## License

This project is licensed under the MIT License - see the LICENSE file for details.
