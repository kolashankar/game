-- ChronoCore PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role_enum AS ENUM ('user', 'admin');
CREATE TYPE game_status_enum AS ENUM ('created', 'active', 'paused', 'completed');
CREATE TYPE game_era_enum AS ENUM ('Initiation', 'Progression', 'Distortion', 'Equilibrium');
CREATE TYPE player_role_enum AS ENUM ('Techno Monk', 'Shadow Broker', 'Chrono Diplomat', 'Bio-Smith');
CREATE TYPE quest_type_enum AS ENUM ('Ethical', 'Technical', 'Diplomatic', 'Temporal', 'General');
CREATE TYPE quest_status_enum AS ENUM ('active', 'completed', 'failed', 'expired');
CREATE TYPE technology_focus_enum AS ENUM ('Balanced', 'Military', 'Scientific', 'Cultural', 'Economic', 'Spiritual', 'Ecological');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    bio TEXT,
    role user_role_enum DEFAULT 'user',
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    join_code VARCHAR(6) NOT NULL UNIQUE,
    status game_status_enum DEFAULT 'created',
    max_players INTEGER DEFAULT 6,
    current_era game_era_enum DEFAULT 'Initiation',
    current_turn INTEGER DEFAULT 0,
    current_player_index INTEGER DEFAULT 0,
    global_karma INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    creator_id UUID NOT NULL REFERENCES users(id),
    ai_game_state_id VARCHAR(100),
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role player_role_enum NOT NULL,
    name VARCHAR(50) NOT NULL,
    avatar VARCHAR(255),
    karma INTEGER DEFAULT 0,
    resources INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    is_ready BOOLEAN DEFAULT FALSE,
    last_action TIMESTAMP,
    ai_player_id VARCHAR(100),
    stats JSONB DEFAULT '{"questsCompleted": 0, "decisionsCount": 0, "realmsControlled": 0, "timeRiftsResolved": 0}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    UNIQUE(game_id, user_id)
);

-- Timelines table
CREATE TABLE timelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    stability INTEGER DEFAULT 100,
    ai_timeline_id VARCHAR(100),
    events JSONB DEFAULT '[]',
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Realms table
CREATE TABLE realms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timeline_id UUID NOT NULL REFERENCES timelines(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES players(id),
    development_level INTEGER DEFAULT 1,
    technology_focus technology_focus_enum DEFAULT 'Balanced',
    ethical_alignment INTEGER DEFAULT 0,
    resources INTEGER DEFAULT 50,
    population INTEGER DEFAULT 1000000,
    ai_realm_id VARCHAR(100),
    coordinates JSONB DEFAULT '{"x": 0, "y": 0}',
    dilemmas JSONB DEFAULT '[]',
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Quests table
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    type quest_type_enum DEFAULT 'General',
    difficulty INTEGER DEFAULT 1,
    options JSONB DEFAULT '[]',
    selected_option INTEGER,
    outcome JSONB,
    status quest_status_enum DEFAULT 'active',
    karma_impact INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    completed_at TIMESTAMP,
    ai_quest_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Decisions table
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES players(id),
    game_id UUID NOT NULL REFERENCES games(id),
    quest_id UUID REFERENCES quests(id),
    decision_text TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    evaluation JSONB DEFAULT '{}',
    karma_impact INTEGER DEFAULT 0,
    ethical_impact TEXT,
    technological_impact TEXT,
    temporal_impact TEXT,
    affected_realms UUID[],
    affected_timelines UUID[],
    turn INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Time Rifts table
CREATE TABLE time_rifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timeline_id UUID NOT NULL REFERENCES timelines(id),
    game_id UUID NOT NULL REFERENCES games(id),
    realm_id UUID REFERENCES realms(id),
    description TEXT NOT NULL,
    severity INTEGER DEFAULT 1,
    coordinates JSONB DEFAULT '{"x": 0, "y": 0}',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by_id UUID REFERENCES players(id),
    created_at_turn INTEGER NOT NULL,
    resolved_at_turn INTEGER,
    effects JSONB DEFAULT '{}',
    ai_rift_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Game Events table
CREATE TABLE game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id),
    player_id UUID REFERENCES players(id),
    event_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    affected_players UUID[],
    affected_realms UUID[],
    affected_timelines UUID[],
    karma_impact INTEGER DEFAULT 0,
    turn INTEGER NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_games_join_code ON games(join_code);
CREATE INDEX idx_games_creator ON games(creator_id);
CREATE INDEX idx_players_game ON players(game_id);
CREATE INDEX idx_players_user ON players(user_id);
CREATE INDEX idx_timelines_game ON timelines(game_id);
CREATE INDEX idx_realms_timeline ON realms(timeline_id);
CREATE INDEX idx_realms_owner ON realms(owner_id);
CREATE INDEX idx_quests_player ON quests(player_id);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_decisions_player ON decisions(player_id);
CREATE INDEX idx_decisions_game ON decisions(game_id);
CREATE INDEX idx_time_rifts_timeline ON time_rifts(timeline_id);
CREATE INDEX idx_time_rifts_game ON time_rifts(game_id);
CREATE INDEX idx_game_events_game ON game_events(game_id);
CREATE INDEX idx_game_events_player ON game_events(player_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_games_modtime
BEFORE UPDATE ON games
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_players_modtime
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_timelines_modtime
BEFORE UPDATE ON timelines
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_realms_modtime
BEFORE UPDATE ON realms
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_quests_modtime
BEFORE UPDATE ON quests
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_decisions_modtime
BEFORE UPDATE ON decisions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_time_rifts_modtime
BEFORE UPDATE ON time_rifts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_game_events_modtime
BEFORE UPDATE ON game_events
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
