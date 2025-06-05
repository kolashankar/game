import React from 'react';

interface Player {
  id: string;
  username: string;
  role: string;
  color: string;
  resources?: Record<string, number>;
  karmaScore?: number;
  techLevel?: number;
}

interface PlayerPanelProps {
  players: Player[];
  currentPlayerId: string;
  userId: string;
}

/**
 * Player panel component for displaying player information
 */
const PlayerPanel: React.FC<PlayerPanelProps> = ({ 
  players = [], 
  currentPlayerId, 
  userId 
}) => {
  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-3">Players</h3>
      <div className="space-y-3">
        {players.map((player) => (
          <PlayerCard 
            key={player.id} 
            player={player} 
            isCurrentPlayer={player.id === currentPlayerId}
            isUser={player.id === userId}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Player card component for displaying individual player information
 */
const PlayerCard: React.FC<{ 
  player: Player; 
  isCurrentPlayer: boolean;
  isUser: boolean;
}> = ({ player, isCurrentPlayer, isUser }) => {
  return (
    <div 
      className={`p-3 rounded-lg transition-colors ${
        isCurrentPlayer 
          ? 'bg-primary-900 bg-opacity-30 border border-primary-700' 
          : 'bg-dark-700'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Player avatar */}
        <div 
          className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: player.color || '#4B5563' }}
        >
          <span className="text-lg font-medium text-white">
            {player.username.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Player info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">
              {player.username}
              {isUser && <span className="text-xs text-gray-400 ml-1">(You)</span>}
            </h4>
            {isCurrentPlayer && (
              <span className="text-xs px-2 py-0.5 bg-primary-900 text-primary-500 border border-primary-700 rounded-full">
                Current Turn
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">{player.role}</p>
        </div>
      </div>
      
      {/* Player stats */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="text-center">
          <p className="text-xs text-gray-500">Karma</p>
          <p className="text-sm font-medium">{player.karmaScore || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Tech</p>
          <p className="text-sm font-medium">{player.techLevel || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Resources</p>
          <p className="text-sm font-medium">
            {player.resources ? Object.values(player.resources).reduce((a, b) => a + b, 0) : 0}
          </p>
        </div>
      </div>
      
      {/* Expanded view for current user */}
      {isUser && player.resources && (
        <div className="mt-3 pt-3 border-t border-dark-600">
          <p className="text-xs text-gray-500 mb-2">Your Resources</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(player.resources).map(([resource, amount]) => (
              <div 
                key={resource}
                className="text-xs px-2 py-1 bg-dark-800 rounded-full"
              >
                {resource}: {amount}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerPanel;
