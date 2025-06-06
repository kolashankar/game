# ChronoCore: Path of Realities

A futuristic, analogical, and engaging board game that blends strategy, ethics, tech, and emotion. Players are Architects of Reality, manipulating time, ethics, and technology to shape civilizations across alternate futures.

![ChronoCore Game](https://placeholder-for-game-image.com/chronocore-banner.jpg)

## About

ChronoCore is a full-stack digital board game that combines strategic gameplay with ethical decision-making in a rich sci-fi setting. Players navigate through multiple timelines, build and manage realms, research technologies, and make decisions that affect the stability of the multiverse.

## Tech Stack

### Frontend
- React
- Tailwind CSS
- Three.js (for 3D board visualization)

### Backend
- Node.js
- Express
- Socket.IO (for real-time gameplay)

### AI Engine
- Python
- LangChain
- OpenAI

### Database
- PostgreSQL (game state, user profiles)
- MongoDB (game events, logs)
- Pinecone (vector database for AI)

### Companion App
- Flutter
- ARCore (for augmented reality features)

### Deployment
- Vercel (frontend)
- Supabase (backend services)
- Cloudflare (CDN, security)

## Project Structure

```
/
├── frontend/                # React frontend
├── backend/                 # Node.js backend
├── ai-engine/               # Python AI engine
├── mobile/                  # Flutter mobile app
├── database/                # Database schemas and migrations
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Flutter SDK
- Docker and Docker Compose (for local development)
- PostgreSQL 14+
- MongoDB 5+
- OpenAI API key (for AI features)

### Environment Variables

Create the following `.env` files for each component:

#### Backend (.env)
```
PORT=5000
JWT_SECRET=
MONGODB_URI=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_HOST=
AI_ENGINE_URL=https://game-ai-engine.onrender.com
```

#### Frontend (.env.local)
```
VITE_API_URL=https://game-ujiz.onrender.com
VITE_SOCKET_URL=https://game-ujiz.onrender.com
```

#### AI Engine (.env)
```
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=your_pinecone_environment
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/chronocore.git
cd chronocore
```

2. Install dependencies and start the development environment

#### Using Docker (recommended for full-stack development)
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Manual Setup (for individual component development)

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at https://game-frontend-7455.onrender.com

**Backend**
```bash
cd backend
npm install
npm run dev
```
The backend API will be available at https://game-ujiz.onrender.com

**AI Engine**
```bash
cd ai-engine
pip install -r requirements.txt
python main.py
```
The AI Engine will be available at https://game-ai-engine.onrender.com

**Mobile App**
```bash
cd mobile
flutter pub get
flutter run
```

### Database Setup

**PostgreSQL**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE chronocore;"

# Run migrations (from backend directory)
cd backend
npm run migrate
```

**MongoDB**
MongoDB collections will be created automatically when the backend starts.

### Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test

# Run AI engine tests
cd ai-engine
python -m pytest
```

## Game Overview

### Theme
A multidimensional timeline-based game where players are Architects of Reality, manipulating time, ethics, and technology to shape civilizations across alternate futures.

### Key Features
1. **Multiverse Board System**: Modular and expandable board made of hexagonal tiles representing different timelines and realms.
2. **Ethical Dilemmas**: Face moral choices that affect your karma score and the stability of the multiverse.
3. **Technology Research**: Develop technologies that grant special abilities and advantages.
4. **AI-Generated Storytelling**: Dynamic quests and narratives generated based on game state and player actions.
5. **Real-time Multiplayer**: Play with friends in real-time with Socket.IO integration.

### Player Roles
- **Techno Monk**: Spiritual tech leaders who excel at research and timeline stabilization.
  - Special Ability: Can stabilize timelines at a reduced cost.
  - Starting Bonus: +2 to all research actions.

- **Shadow Broker**: Ethical hackers who manipulate information and resources.
  - Special Ability: Can see hidden information about realms.
  - Starting Bonus: Begin with extra resource cards.

- **Chrono Diplomat**: Peacekeepers who excel at navigating between timelines.
  - Special Ability: Can move between non-adjacent realms once per turn.
  - Starting Bonus: +1 karma at the start of the game.

- **Bio-Smith**: Genetic eco-engineers who specialize in realm development.
  - Special Ability: Can upgrade realms at a reduced cost.
  - Starting Bonus: Start with one pre-developed realm.

### Game Mechanics

#### Turn Structure
1. **Movement Phase**: Move your character to a different realm.
2. **Action Phase**: Perform one of the following actions:
   - Gather resources from the current realm
   - Research a technology
   - Build or upgrade a structure
   - Stabilize the current realm
   - Complete a quest
3. **Event Phase**: Resolve any events or ethical dilemmas.

#### Karma System
Karma is a central mechanic that reflects the ethical choices made by players:
- Positive karma actions: Helping other players, stabilizing timelines, resolving ethical dilemmas positively
- Negative karma actions: Sabotaging other players, destabilizing timelines for personal gain

#### Technology Tree
Players can research technologies across four categories:
- **Temporal**: Improves movement and timeline manipulation
- **Ethical**: Enhances karma gain and provides ethical insights
- **Material**: Increases resource production and efficiency
- **Biological**: Improves realm development and population growth

### Victory Conditions
Win by reaching Equilibrium, defined as:
- Minimum karma: +10 or higher
- Owning 4+ developed realms
- Having at least 3 timeline connections
- Resolving one major Timeline Rift event

### AI Integration
The game features advanced AI integration through our custom AI engine:
- Dynamic storytelling based on game state
- Personalized quests and ethical dilemmas
- Adaptive difficulty based on player performance
- Karma calculation based on complex ethical models

## Contributing

We welcome contributions to ChronoCore! Here's how you can help:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- **Frontend**: Follow React best practices and use TypeScript for type safety
- **Backend**: Follow Node.js best practices and use TypeScript
- **AI Engine**: Follow PEP 8 style guide for Python code

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the documentation if needed
3. The PR should work in all environments (development, test, production)
4. PRs require at least one code review before being merged

## Project Roadmap

### Phase 1: Core Gameplay (Current)
- ✅ Basic game mechanics and board implementation
- ✅ User authentication and profiles
- ✅ Real-time multiplayer functionality
- ✅ AI engine integration for storytelling

### Phase 2: Enhanced Features (Next)
- 🔄 Advanced technology tree with more options
- 🔄 Expanded ethical dilemma system
- 🔄 Achievement system and player statistics
- 🔄 Mobile companion app development

### Phase 3: Community and Expansion
- 📅 User-generated content and custom scenarios
- 📅 Tournament system and ranked play
- 📅 Additional player roles and abilities
- 📅 AR features for physical-digital hybrid gameplay

## License
[MIT License](LICENSE)
