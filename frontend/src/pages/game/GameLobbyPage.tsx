import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGame } from '../../hooks/useGame';
import LoadingScreen from '../../components/common/LoadingScreen';

/**
 * Game lobby page component
 */
const GameLobbyPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const { 
    currentGame, 
    fetchGameById, 
    joinGame, 
    leaveGame, 
    startGame,
    loading, 
    error 
  } = useGame();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  // Available player roles
  const availableRoles = [
    { id: 'techno-monk', name: 'Techno Monk', description: 'Masters of technology and spirituality' },
    { id: 'shadow-broker', name: 'Shadow Broker', description: 'Information dealers with vast networks' },
    { id: 'chrono-diplomat', name: 'Chrono Diplomat', description: 'Negotiators across timelines' },
    { id: 'bio-smith', name: 'Bio-Smith', description: 'Genetic engineers and biological architects' }
  ];

  // Fetch game data on component mount
  useEffect(() => {
    if (gameId) {
      fetchGameById(gameId);
    }
  }, [gameId, fetchGameById]);

  // Check if current user is already in the game
  const isUserInGame = currentGame?.players?.some(player => 
    user?.isGuest 
      ? player.id === localStorage.getItem('guestId')
      : player.id === user?.id
  ) || false;

  // Check if current user is the game creator
  const isCreator = user?.isGuest
    ? localStorage.getItem('guestId') === currentGame?.creatorId
    : currentGame?.creatorId === user?.id;

  // Check if game can be started
  const canStartGame = isCreator && (currentGame?.players?.length || 0) >= 2;

  // Handle joining the game
  const handleJoinGame = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    if (!gameId) {
      alert('No game ID provided');
      return;
    }

    try {
      setIsJoining(true);
      await joinGame(gameId, selectedRole);
      // Refresh game data after joining
      await fetchGameById(gameId);
    } catch (error: any) {
      console.error('Failed to join game:', error);
      alert(error.message || 'Failed to join game. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle leaving the game
  const handleLeaveGame = async () => {
    if (!gameId) return;
    
    setIsLeaving(true);
    try {
      await leaveGame(gameId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to leave game:', error);
    } finally {
      setIsLeaving(false);
    }
  };

  // Handle starting the game
  const handleStartGame = async () => {
    if (!canStartGame || !gameId) return;

    try {
      setIsStarting(true);
      await startGame(gameId);
      // Navigate to game board when game starts
      navigate(`/games/${gameId}/board`);
    } catch (error: any) {
      console.error('Failed to start game:', error);
      alert(error.message || 'Failed to start game. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  if (loading && !currentGame) {
    return <LoadingScreen message="Loading Game Lobby" />;
  }

  if (!currentGame) {
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

  return (
    <div className="space-y-8">
      {/* Game header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">{currentGame.name}</h1>
            <p className="text-gray-400 mt-1">Created by {currentGame.creator.username}</p>
          </div>
          <div className="flex gap-3">
            {isUserInGame ? (
              <>
                {isCreator && (
                  <button
                    onClick={handleStartGame}
                    className="btn-primary"
                    disabled={!canStartGame || isStarting}
                  >
                    {isStarting ? 'Starting...' : 'Start Game'}
                  </button>
                )}
                <button
                  onClick={handleLeaveGame}
                  className="btn-secondary"
                  disabled={isLeaving}
                >
                  {isLeaving ? 'Leaving...' : 'Leave Game'}
                </button>
              </>
            ) : (
              <button
                onClick={handleJoinGame}
                className="btn-primary"
                disabled={
                  isJoining || 
                  !selectedRole || 
                  currentGame.players.length >= currentGame.maxPlayers
                }
              >
                {isJoining ? 'Joining...' : 'Join Game'}
              </button>
            )}
          </div>
        </div>
        
        {/* Game details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-dark-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Status</p>
            <p className="text-lg font-semibold">
              {currentGame.status === 'waiting' ? 'Waiting for Players' : currentGame.status}
            </p>
          </div>
          <div className="bg-dark-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Players</p>
            <p className="text-lg font-semibold">
              {currentGame.players.length}/{currentGame.maxPlayers}
            </p>
          </div>
          <div className="bg-dark-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Starting Era</p>
            <p className="text-lg font-semibold">{currentGame.startingEra}</p>
          </div>
        </div>
        
        {/* Game description if available */}
        {currentGame.description && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-300">{currentGame.description}</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-secondary-900 border border-secondary-800 text-secondary-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Player list */}
      <div className="card p-6">
        <h2 className="text-2xl font-display font-semibold mb-4">Players</h2>
        <div className="space-y-4">
          {currentGame.players.map((player) => (
            <div 
              key={player.id} 
              className="flex items-center p-3 bg-dark-700 rounded-lg"
            >
              <div className="h-10 w-10 rounded-full bg-primary-900 flex items-center justify-center mr-4">
                <span className="text-lg font-medium">
                  {player.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold">{player.username}</p>
                <p className="text-sm text-gray-400">{player.role}</p>
              </div>
              {player.id === currentGame.creator.id && (
                <span className="ml-auto text-xs px-2 py-1 bg-primary-900 text-primary-500 border border-primary-700 rounded-full">
                  Host
                </span>
              )}
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: currentGame.maxPlayers - currentGame.players.length }).map((_, index) => (
            <div 
              key={`empty-${index}`} 
              className="flex items-center p-3 bg-dark-800 rounded-lg border border-dashed border-dark-600"
            >
              <div className="h-10 w-10 rounded-full bg-dark-700 flex items-center justify-center mr-4">
                <span className="text-gray-500">?</span>
              </div>
              <p className="text-gray-500">Waiting for player...</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role selection (if not joined) */}
      {!isUserInGame && (
        <div className="card p-6">
          <h2 className="text-2xl font-display font-semibold mb-4">Select Your Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRoles.map((role) => {
              // Check if role is already taken
              const isRoleTaken = currentGame.players.some(
                player => player.role.toLowerCase() === role.name.toLowerCase()
              );
              
              return (
                <div 
                  key={role.id}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedRole === role.id 
                      ? 'border-primary-500 bg-primary-900 bg-opacity-20' 
                      : 'border-dark-600 bg-dark-700 hover:border-dark-500'}
                    ${isRoleTaken ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => !isRoleTaken && setSelectedRole(role.id)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{role.name}</h3>
                    {isRoleTaken && (
                      <span className="text-xs px-2 py-1 bg-dark-800 text-gray-400 rounded-full">
                        Taken
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{role.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Game rules */}
      <div className="card p-6">
        <h2 className="text-2xl font-display font-semibold mb-4">Game Rules</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            <strong>ChronoCore: Path of Realities</strong> is a strategic board game set in a multiverse 
            where players navigate different timelines and make ethical choices that impact the game world.
          </p>
          <p>
            Each player takes on a unique role with special abilities and must collaborate and compete 
            to achieve their objectives while maintaining the stability of the multiverse.
          </p>
          <p>
            The game is played in turns, with each player taking actions such as moving between realms, 
            gathering resources, completing quests, and making decisions that affect their karma score.
          </p>
          <p>
            The winner is determined by a combination of objectives completed, realms controlled, 
            and karma score at the end of the game.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameLobbyPage;
