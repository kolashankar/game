import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGame } from '../../hooks/useGame';
import LoadingScreen from '../../components/common/LoadingScreen';
import GameChat from '../../components/game/GameChat';
import PlayerPanel from '../../components/game/PlayerPanel';
import GameControls from '../../components/game/GameControls';
import QuestModal from '../../components/game/QuestModal';
import DecisionModal from '../../components/game/DecisionModal';
import GameBoard from '../../components/game/GameBoard';

/**
 * Game board page component
 */
const GameBoardPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const { 
    currentGame, 
    fetchGameById, 
    makeMove,
    completeQuest,
    makeDecision,
    endTurn,
    loading, 
    error 
  } = useGame();
  const [activeQuest, setActiveQuest] = useState<any>(null);
  const [activeDecision, setActiveDecision] = useState<any>(null);
  const [selectedRealm, setSelectedRealm] = useState<string | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const boardRef = useRef<any>(null);
  const navigate = useNavigate();

  // Fetch game data on component mount
  useEffect(() => {
    if (gameId) {
      fetchGameById(gameId);
    }
  }, [gameId, fetchGameById]);

  // Check if it's the current user's turn
  const isUserTurn = currentGame?.currentPlayer?.id === user?.id;

  // Handle realm selection
  const handleRealmSelect = (realmId: string) => {
    setSelectedRealm(realmId);
    
    // Check if the realm has an active quest
    const realm = currentGame?.realms.find(r => r.id === realmId);
    if (realm?.activeQuest) {
      setActiveQuest(realm.activeQuest);
    }
  };

  // Handle player movement
  const handleMove = async (realmId: string) => {
    if (!gameId || !isUserTurn) return;
    
    try {
      await makeMove(gameId, realmId);
      setSelectedRealm(realmId);
      
      // Add to game log
      setGameLog(prev => [...prev, `${user?.username} moved to ${realmId}.`]);
    } catch (error) {
      console.error('Failed to make move:', error);
    }
  };

  // Handle quest completion
  const handleCompleteQuest = async (questId: string, choiceId: string) => {
    if (!gameId || !isUserTurn) return;
    
    try {
      const result = await completeQuest(gameId, questId, choiceId);
      setActiveQuest(null);
      
      // Add to game log
      setGameLog(prev => [...prev, `${user?.username} completed a quest in ${selectedRealm}.`]);
      
      // Check if there's a decision to make based on the quest outcome
      if (result?.decision) {
        setActiveDecision(result.decision);
      }
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  // Handle ethical decision
  const handleMakeDecision = async (decisionId: string, choiceId: string) => {
    if (!gameId || !isUserTurn) return;
    
    try {
      await makeDecision(gameId, decisionId, choiceId);
      setActiveDecision(null);
      
      // Add to game log
      setGameLog(prev => [...prev, `${user?.username} made an ethical decision.`]);
    } catch (error) {
      console.error('Failed to make decision:', error);
    }
  };

  // Handle end turn
  const handleEndTurn = async () => {
    if (!gameId || !isUserTurn) return;
    
    try {
      await endTurn(gameId);
      
      // Add to game log
      setGameLog(prev => [...prev, `${user?.username} ended their turn.`]);
    } catch (error) {
      console.error('Failed to end turn:', error);
    }
  };

  // Handle chat message
  const handleSendMessage = (message: string) => {
    if (!message.trim() || !user) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: user.username,
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    
    // TODO: Send message via socket.io
  };

  if (loading && !currentGame) {
    return <LoadingScreen message="Loading Game" />;
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
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Game header */}
      <div className="bg-dark-800 p-4 rounded-lg mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-2xl font-display font-bold">{currentGame.name}</h1>
            <p className="text-gray-400 text-sm">
              Era: {currentGame.currentEra} | Turn: {currentGame.currentTurn}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full ${
              isUserTurn 
                ? 'bg-primary-900 text-primary-500 border border-primary-700' 
                : 'bg-dark-700 text-gray-400 border border-dark-600'
            }`}>
              {isUserTurn ? 'Your Turn' : `${currentGame.currentPlayer?.username}'s Turn`}
            </span>
            {isUserTurn && (
              <button
                onClick={handleEndTurn}
                className="btn-secondary btn-sm"
              >
                End Turn
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-secondary-900 border border-secondary-800 text-secondary-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Main game area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Left panel - Player info */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <PlayerPanel 
            players={currentGame.players} 
            currentPlayerId={currentGame.currentPlayer?.id} 
            userId={user?.id}
          />
          
          {/* Game controls */}
          <GameControls 
            isUserTurn={isUserTurn}
            selectedRealm={selectedRealm}
            onEndTurn={handleEndTurn}
          />
        </div>
        
        {/* Center - Game board */}
        <div className="lg:col-span-2 flex flex-col">
          <GameBoard
            ref={boardRef}
            realms={currentGame.realms}
            players={currentGame.players}
            currentPlayerId={currentGame.currentPlayer?.id}
            selectedRealm={selectedRealm}
            onRealmSelect={handleRealmSelect}
            onMove={handleMove}
            isUserTurn={isUserTurn}
          />
        </div>
        
        {/* Right panel - Chat and game log */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <GameChat 
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
          
          {/* Game log */}
          <div className="card p-4 flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Game Log</h3>
            <div className="space-y-2">
              {gameLog.map((log, index) => (
                <p key={index} className="text-sm text-gray-400">
                  {log}
                </p>
              ))}
              {gameLog.length === 0 && (
                <p className="text-sm text-gray-500 italic">Game events will appear here.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quest modal */}
      {activeQuest && (
        <QuestModal
          quest={activeQuest}
          onComplete={handleCompleteQuest}
          onClose={() => setActiveQuest(null)}
        />
      )}

      {/* Decision modal */}
      {activeDecision && (
        <DecisionModal
          decision={activeDecision}
          onDecide={handleMakeDecision}
          onClose={() => setActiveDecision(null)}
        />
      )}
    </div>
  );
};

export default GameBoardPage;
