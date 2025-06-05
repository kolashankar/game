import React, { useState } from 'react';

interface CreateGameModalProps {
  onClose: () => void;
  onCreate: (gameData: any) => void;
}

/**
 * Modal for creating a new game
 */
const CreateGameModal: React.FC<CreateGameModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [startingEra, setStartingEra] = useState('Neo-Renaissance');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Available eras for the game
  const eras = [
    'Neo-Renaissance',
    'Quantum Age',
    'Bio-Digital Convergence',
    'Post-Singularity',
    'Cosmic Expansion'
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!name.trim()) {
      setError('Please enter a game name');
      return;
    }

    if (maxPlayers < 2 || maxPlayers > 6) {
      setError('Number of players must be between 2 and 6');
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        name,
        maxPlayers,
        isPrivate,
        startingEra,
        description: description.trim() || undefined
      });
    } catch (err) {
      setError('Failed to create game. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div className="card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold">Create New Game</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-secondary-900 border border-secondary-800 text-secondary-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-300 mb-2">
              Game Name <span className="text-secondary-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              placeholder="Enter a name for your game"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="maxPlayers" className="block text-gray-300 mb-2">
              Max Players <span className="text-secondary-500">*</span>
            </label>
            <input
              type="number"
              id="maxPlayers"
              className="input w-full"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              min={2}
              max={6}
              disabled={loading}
              required
            />
            <p className="text-gray-500 text-sm mt-1">Between 2 and 6 players</p>
          </div>

          <div className="mb-4">
            <label htmlFor="startingEra" className="block text-gray-300 mb-2">
              Starting Era <span className="text-secondary-500">*</span>
            </label>
            <select
              id="startingEra"
              className="input w-full"
              value={startingEra}
              onChange={(e) => setStartingEra(e.target.value)}
              disabled={loading}
              required
            >
              {eras.map((era) => (
                <option key={era} value={era}>
                  {era}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              className="input w-full min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Optional description for your game"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary-500 rounded"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={loading}
              />
              <span className="ml-2 text-gray-300">Private Game (invite only)</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGameModal;
