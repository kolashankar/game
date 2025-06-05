import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGame } from '../../hooks/useGame';
import LoadingScreen from '../../components/common/LoadingScreen';

/**
 * Game summary page component for displaying game results
 */
const GameSummaryPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const { fetchGameById, loading, error } = useGame();
  const [game, setGame] = useState<any>(null);
  const navigate = useNavigate();

  // Fetch game data on component mount
  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) return;
      
      try {
        const gameData = await fetchGameById(gameId);
        setGame(gameData);
      } catch (error) {
        console.error('Failed to load game:', error);
      }
    };

    loadGame();
  }, [gameId, fetchGameById]);

  if (loading && !game) {
    return <LoadingScreen message="Loading Game Summary" />;
  }

  if (!game) {
    return (
      <div className="card p-6 text-center">
        <h2 className="text-2xl font-display font-bold mb-4">Game Not Found</h2>
        <p className="text-gray-400 mb-6">The game you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-primary"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Find the winner
  const winner = game.players.find((player: any) => player.id === game.winnerId);
  
  // Check if current user won
  const userWon = winner?.id === user?.id;
  
  // Find user's player data
  const userPlayer = game.players.find((player: any) => player.id === user?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Game header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">{game.name}</h1>
            <p className="text-gray-400 mt-1">
              Completed on {new Date(game.completedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="btn-secondary"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-secondary-900 border border-secondary-800 text-secondary-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Game result */}
      <div className="card p-6">
        <h2 className="text-2xl font-display font-semibold mb-6">Game Result</h2>
        
        <div className={`p-6 rounded-lg text-center mb-8 ${
          userWon 
            ? 'bg-green-900 bg-opacity-20 border border-green-700' 
            : 'bg-secondary-900 bg-opacity-20 border border-secondary-700'
        }`}>
          <h3 className="text-xl font-semibold mb-2">
            {userWon ? 'Victory!' : 'Game Over'}
          </h3>
          <p className="text-lg">
            {winner 
              ? `${winner.username} won the game as ${winner.role}` 
              : 'The game ended in a draw'}
          </p>
          {userPlayer && (
            <div className="mt-4">
              <p className="text-gray-300">
                Your final karma score: <span className="font-semibold">{userPlayer.karmaScore}</span>
              </p>
              <p className="text-gray-300">
                Tech level achieved: <span className="font-semibold">{userPlayer.techLevel}</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Player rankings */}
        <h3 className="text-xl font-semibold mb-4">Player Rankings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-dark-600">
                <th className="pb-2 font-medium">Rank</th>
                <th className="pb-2 font-medium">Player</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium text-right">Karma</th>
                <th className="pb-2 font-medium text-right">Tech Level</th>
                <th className="pb-2 font-medium text-right">Realms</th>
              </tr>
            </thead>
            <tbody>
              {game.players
                .sort((a: any, b: any) => b.karmaScore - a.karmaScore)
                .map((player: any, index: number) => (
                  <tr 
                    key={player.id} 
                    className={`border-b border-dark-700 ${
                      player.id === user?.id ? 'bg-dark-800 bg-opacity-50' : ''
                    }`}
                  >
                    <td className="py-3 font-medium">{index + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: player.color || '#4B5563' }}>
                          <span className="text-sm font-medium">
                            {player.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className={player.id === winner?.id ? 'font-semibold' : ''}>
                          {player.username}
                          {player.id === user?.id && <span className="text-xs text-gray-400 ml-1">(You)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-300">{player.role}</td>
                    <td className="py-3 text-right font-medium">{player.karmaScore}</td>
                    <td className="py-3 text-right">{player.techLevel}</td>
                    <td className="py-3 text-right">{player.realms?.length || 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Game statistics */}
      <div className="card p-6">
        <h2 className="text-2xl font-display font-semibold mb-6">Game Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Game Duration</h3>
            <p className="text-2xl">
              {game.totalTurns} Turns
            </p>
            <p className="text-gray-400 text-sm">
              {Math.floor((new Date(game.completedAt).getTime() - new Date(game.startedAt).getTime()) / (1000 * 60))} minutes
            </p>
          </div>
          
          <div className="bg-dark-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Timeline Stability</h3>
            <div className="w-full bg-dark-800 rounded-full h-4 mb-2">
              <div 
                className={`h-4 rounded-full ${
                  game.finalStability > 70 
                    ? 'bg-green-500' 
                    : game.finalStability > 40 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${game.finalStability}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm">
              Final stability: {game.finalStability}%
            </p>
          </div>
          
          <div className="bg-dark-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Ethical Decisions</h3>
            <p className="text-2xl">
              {game.totalDecisions || 0}
            </p>
            <p className="text-gray-400 text-sm">
              Decisions made across all players
            </p>
          </div>
        </div>
      </div>

      {/* Game timeline */}
      <div className="card p-6">
        <h2 className="text-2xl font-display font-semibold mb-6">Key Moments</h2>
        
        {game.keyEvents && game.keyEvents.length > 0 ? (
          <div className="relative pl-8 border-l-2 border-dark-600 space-y-8">
            {game.keyEvents.map((event: any, index: number) => (
              <div key={index} className="relative">
                <div className="absolute -left-10 w-5 h-5 rounded-full bg-primary-900 border-2 border-primary-700" />
                <div className="mb-1 text-gray-400 text-sm">
                  Turn {event.turn}
                </div>
                <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
                <p className="text-gray-300">{event.description}</p>
                {event.player && (
                  <p className="text-sm text-gray-400 mt-1">
                    {event.player.username} • {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No key events recorded for this game.</p>
        )}
      </div>

      {/* Play again button */}
      <div className="text-center py-6">
        <Link to="/dashboard" className="btn-primary px-8 py-3">
          Play Another Game
        </Link>
      </div>
    </div>
  );
};

export default GameSummaryPage;
