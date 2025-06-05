/**
 * Game Model
 * Defines the Sequelize model for game sessions
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres.config');

// Define Game model first
const Game = sequelize.define('games', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Add the missing creatorId field
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('waiting', 'active', 'completed', 'abandoned'),
    defaultValue: 'waiting'
  },
  currentEra: {
    type: DataTypes.ENUM('Initiation', 'Progression', 'Distortion', 'Equilibrium'),
    defaultValue: 'Initiation'
  },
  currentTurn: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  currentPlayerIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    validate: {
      min: 2,
      max: 6
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  winCondition: {
    type: DataTypes.STRING,
    defaultValue: 'Equilibrium'
  },
  globalKarma: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  boardConfig: {
    type: DataTypes.JSON,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

// Player in a game model - Fixed to match your associations
const GamePlayer = sequelize.define('game_players', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Add explicit foreign keys
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'games',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('Techno Monk', 'Shadow Broker', 'Chrono Diplomat', 'Bio-Smith'),
    allowNull: false
  },
  karma: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ownedRealms: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  techLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  unlockedTechnologies: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  currentResearch: {
    type: DataTypes.STRING,
    allowNull: true
  },
  researchProgress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  inventory: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  isReady: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isWinner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastAction: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

// Game events model
const GameEvent = sequelize.define('game_events', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Add explicit foreign key
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'games',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  affectedPlayers: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  affectedRealms: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  karmaImpact: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  turn: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  timestamps: true
});

// Timeline model
const Timeline = sequelize.define('timelines', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Add explicit foreign key
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'games',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stability: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  techLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  karmaAlignment: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  connectedTimelines: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  }
}, {
  timestamps: true
});

// Realm model
const Realm = sequelize.define('realms', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Add explicit foreign key
  timelineId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'timelines',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.JSON,
    allowNull: false
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  developmentLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  resources: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  structures: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  adjacentRealms: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  }
}, {
  timestamps: true
});

module.exports = {
  Game,
  GamePlayer,
  GameEvent,
  Timeline,
  Realm
};