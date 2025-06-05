import React from 'react';
import { Link } from 'react-router-dom';
import { Game } from '../../context/GameContext';

interface GameListProps {
  games: Game[];
}

/**
 * Game list component for displaying available and active games
 */
const GameList: React.FC<GameListProps> = ({ games }) => {
  if (games.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-400">No games available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};

/**
 * Game card component for displaying a single game
 */
const GameCard: React.FC<{ game: Game }> = ({ game }) => {
  // Determine card styling based on game status
  const getCardClass = () => {
    switch (game.status) {
      case 'active':
        return 'border-tech-500 hover:shadow-neon-tech';
      case 'waiting':
        return 'border-primary-500 hover:shadow-neon';
      case 'completed':
        return 'border-time-500 hover:shadow-neon-time';
      default:
        return 'border-dark-600';
    }
  };

  // Determine badge styling based on game status
  const getBadgeClass = () => {
    switch (game.status) {
      case 'active':
        return 'bg-tech-900 text-tech-500 border-tech-700';
      case 'waiting':
        return 'bg-primary-900 text-primary-500 border-primary-700';
      case 'completed':
        return 'bg-time-900 text-time-500 border-time-700';
      case 'abandoned':
        return 'bg-dark-800 text-gray-400 border-dark-600';
      default:
        return 'bg-dark-800 text-gray-400 border-dark-600';
    }
  };

  // Format status label
  const getStatusLabel = () => {
    switch (game.status) {
      case 'active':
        return 'In Progress';
      case 'waiting':
        return 'Waiting for Players';
      case 'completed':
        return 'Completed';
      case 'abandoned':
        return 'Abandoned';
      default:
        return game.status;
    }
  };

  // Determine link path based on game status
  const getLinkPath = () => {
    if (game.status === 'waiting') {
      return `/games/${game.id}/lobby`;
    } else if (game.status === 'active') {
      return `/games/${game.id}/board`;
    } else {
      return `/games/${game.id}/summary`;
    }
  };

  return (
    <Link to={getLinkPath()}>
      <div className={`card p-5 border transition-all duration-300 ${getCardClass()}`}>
        {/* Game status badge */}
        <div className="flex justify-between items-start mb-3">
          <span className={`text-xs px-2 py-1 rounded-full border ${getBadgeClass()}`}>
            {getStatusLabel()}
          </span>
          {game.isPrivate && (
            <span className="text-xs px-2 py-1 bg-dark-800 text-gray-400 border border-dark-600 rounded-full">
              Private
            </span>
          )}
        </div>

        {/* Game name */}
        <h3 className="text-lg font-display font-semibold mb-2">{game.name}</h3>

        {/* Game details */}
        <div className="text-sm text-gray-400 space-y-1 mb-3">
          <p>
            <span className="text-gray-500">Created by:</span> {game.creator.username}
          </p>
          <p>
            <span className="text-gray-500">Players:</span> {game.players.length}/{game.maxPlayers}
          </p>
          <p>
            <span className="text-gray-500">Era:</span> {game.currentEra}
          </p>
          {game.status === 'active' && (
            <p>
              <span className="text-gray-500">Turn:</span> {game.currentTurn}
            </p>
          )}
        </div>

        {/* Player avatars */}
        <div className="flex -space-x-2 overflow-hidden">
          {game.players.map((player, index) => (
            <div 
              key={player.id} 
              className="inline-block h-8 w-8 rounded-full ring-2 ring-dark-800 bg-dark-700 flex items-center justify-center"
              title={`${player.username} (${player.role})`}
            >
              <span className="text-xs font-medium">
                {player.username.charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default GameList;
