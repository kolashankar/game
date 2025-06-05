import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGame } from '../../hooks/useGame';
import LoadingScreen from '../../components/common/LoadingScreen';
import GameList from '../../components/game/GameList';
import CreateGameModal from '../../components/game/CreateGameModal';

/**
 * Dashboard page component
 */
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { games, fetchGames, loading, error, createGame } = useGame();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch games on component mount
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Handle game creation
  const handleCreateGame = async (gameData: any) => {
    try {
      const newGame = await createGame(gameData);
      setIsCreateModalOpen(false);
      navigate(`/games/${newGame.id}/lobby`);
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  if (loading && games.length === 0) {
    return <LoadingScreen message="Loading Dashboard" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome back, {user?.username}</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          Create New Game
        </button>
      </div>

      {/* Player stats card */}
      <div className="card p-6">
        <h2 className="text-xl font-display font-semibold mb-4">Your Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-gray-400 text-sm">Games Played</p>
            <p className="text-2xl font-semibold">{user?.totalGamesPlayed || 0}</p>
          </div>
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-gray-400 text-sm">Wins</p>
            <p className="text-2xl font-semibold">{user?.totalWins || 0}</p>
          </div>
          <div className="p-4 bg-dark-700 rounded-lg">
            <p className="text-gray-400 text-sm">Karma Score</p>
            <p className="text-2xl font-semibold">{user?.karmaScore || 0}</p>
          </div>
        </div>
        <div className="mt-4 text-right">
          <Link to="/profile" className="text-primary-500 hover:text-primary-400">
            View Full Profile
          </Link>
        </div>
      </div>

      {/* Available games */}
      <div>
        <h2 className="text-2xl font-display font-semibold mb-4">Available Games</h2>
        {error && (
          <div className="bg-secondary-900 border border-secondary-800 text-secondary-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <GameList games={games.filter(game => game.status === 'waiting')} />
      </div>

      {/* Active games */}
      <div>
        <h2 className="text-2xl font-display font-semibold mb-4">Your Active Games</h2>
        <GameList 
          games={games.filter(game => 
            game.status === 'active' && 
            game.players.some(player => player.id === user?.id)
          )} 
        />
      </div>

      {/* Create game modal */}
      {isCreateModalOpen && (
        <CreateGameModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateGame}
        />
      )}
    </div>
  );
};

export default DashboardPage;
