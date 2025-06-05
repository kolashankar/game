import React from 'react';

interface GameControlsProps {
  isUserTurn: boolean;
  selectedRealm: string | null;
  onEndTurn: () => void;
}

/**
 * Game controls component for player actions
 */
const GameControls: React.FC<GameControlsProps> = ({
  isUserTurn,
  selectedRealm,
  onEndTurn
}) => {
  // Actions that can be performed during a player's turn
  const actions = [
    {
      id: 'gather',
      name: 'Gather Resources',
      description: 'Collect resources from the current realm',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
          <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
        </svg>
      ),
      disabled: !isUserTurn
    },
    {
      id: 'research',
      name: 'Research Technology',
      description: 'Advance your tech tree using resources',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      disabled: !isUserTurn
    },
    {
      id: 'build',
      name: 'Build Structure',
      description: 'Construct a building in the current realm',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      ),
      disabled: !isUserTurn
    },
    {
      id: 'stabilize',
      name: 'Stabilize Realm',
      description: 'Improve the stability of the current realm',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      disabled: !isUserTurn
    }
  ];

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold mb-3">Actions</h3>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`
              flex flex-col items-center justify-center p-3 rounded-lg transition-colors
              ${action.disabled 
                ? 'bg-dark-800 text-gray-500 cursor-not-allowed' 
                : 'bg-dark-700 hover:bg-dark-600 text-white'}
            `}
            disabled={action.disabled}
            title={action.description}
          >
            <div className="mb-1">{action.icon}</div>
            <span className="text-sm">{action.name}</span>
          </button>
        ))}
      </div>
      
      {/* End turn button */}
      <button
        onClick={onEndTurn}
        className={`
          w-full py-2 rounded-lg font-medium transition-colors
          ${isUserTurn 
            ? 'bg-primary-600 hover:bg-primary-700 text-white' 
            : 'bg-dark-800 text-gray-500 cursor-not-allowed'}
        `}
        disabled={!isUserTurn}
      >
        End Turn
      </button>
      
      {/* Turn status */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          {isUserTurn 
            ? 'It\'s your turn! Take actions or end your turn.' 
            : 'Waiting for other players to complete their turn...'}
        </p>
      </div>
      
      {/* Selected realm info */}
      {selectedRealm && (
        <div className="mt-4 p-3 bg-dark-800 rounded-lg">
          <p className="text-sm text-gray-400">
            Selected Realm: <span className="text-white">{selectedRealm}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default GameControls;
