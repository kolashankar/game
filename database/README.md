# ChronoCore Database

This directory contains database configuration, schema definitions, and migration scripts for the ChronoCore game.

## Database Architecture

ChronoCore uses a multi-database architecture:

1. **PostgreSQL** - Main relational database for structured game data
   - User accounts
   - Game sessions
   - Player data
   - Timelines and realms
   - Quests and decisions

2. **MongoDB** - NoSQL database for complex, nested game state data
   - Real-time game state
   - AI engine logs
   - Historical game events
   - Timeline events with complex relationships

3. **Pinecone** - Vector database for AI embeddings
   - Semantic search for game content
   - Player decision embeddings
   - Similar scenario retrieval

## Directory Structure

- `/postgres` - PostgreSQL database scripts and schema
- `/mongodb` - MongoDB schema and configuration
- `/pinecone` - Pinecone vector database configuration

## Setup Instructions

### PostgreSQL

1. Install PostgreSQL 14 or higher
2. Create a database named `chronocore`
3. Run the migration scripts in `/postgres/migrations`

```bash
cd postgres
psql -U postgres -d chronocore -f migrations/001_create_tables.sql
```

### MongoDB

1. Install MongoDB 5.0 or higher
2. Create a database named `chronocore_ai`
3. Collections will be created automatically by the application

### Pinecone

1. Create a Pinecone account at https://www.pinecone.io/
2. Create an index named `chronocore-ai` with 1536 dimensions
3. Set your Pinecone API key in the environment variables

## Backup and Restore

Backup scripts are provided in each database directory for regular data backups.

## Maintenance

Regular database maintenance tasks are defined in the `maintenance` directory.
