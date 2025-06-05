import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import TimelineIcon from '@mui/icons-material/Timeline';
import PublicIcon from '@mui/icons-material/Public';
import SettingsIcon from '@mui/icons-material/Settings';
import gameService from '../../services/game.service';
import PlayerList from './PlayerList';
import TimelineView from './TimelineView';
import GameChat from './GameChat';
import GameControls from './GameControls';

/**
 * Game Dashboard Component
 * Main interface for an active game
 */
const GameDashboard = () => {
  const { gameId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [game, setGame] = useState(null);
  const [player, setPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch game data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const gameData = await gameService.getGameById(gameId);
        setGame(gameData);
        
        // Find the current user's player in this game
        const currentPlayer = gameData.players.find(p => p.userId === user.id);
        if (currentPlayer) {
          setPlayer(currentPlayer);
        } else {
          setError('You are not a player in this game');
        }
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError(err.response?.data?.message || 'Failed to load game data');
      } finally {
        setLoading(false);
      }
    };
    
    if (gameId && user) {
      fetchGameData();
    }
  }, [gameId, user]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Refresh game data
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const gameData = await gameService.getGameById(gameId);
      setGame(gameData);
      
      // Find the current user's player in this game
      const currentPlayer = gameData.players.find(p => p.userId === user.id);
      if (currentPlayer) {
        setPlayer(currentPlayer);
      }
    } catch (err) {
      console.error('Error refreshing game data:', err);
      setError(err.response?.data?.message || 'Failed to refresh game data');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle end turn
  const handleEndTurn = async () => {
    try {
      await gameService.endTurn(gameId, player.id);
      handleRefresh();
    } catch (err) {
      console.error('Error ending turn:', err);
      setError(err.response?.data?.message || 'Failed to end turn');
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/games')}>
          Back to Games
        </Button>
      </Box>
    );
  }
  
  // Check if game exists
  if (!game) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Game not found
        </Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/games')}>
          Back to Games
        </Button>
      </Box>
    );
  }
  
  // Determine if it's the current player's turn
  const isPlayerTurn = game.status === 'active' && 
                      game.players[game.currentPlayerIndex]?.id === player?.id;
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Game Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4">{game.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                label={`Status: ${game.status}`} 
                color={game.status === 'active' ? 'success' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Era: ${game.currentEra}`} 
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Turn: ${game.currentTurn}`} 
                variant="outlined"
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Global Karma: ${game.globalKarma}`} 
                color={game.globalKarma > 0 ? 'success' : game.globalKarma < 0 ? 'error' : 'default'}
              />
            </Box>
          </Box>
          
          <Box>
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
            <Button 
              variant="contained" 
              color="primary" 
              disabled={!isPlayerTurn}
              onClick={handleEndTurn}
              sx={{ ml: 1 }}
            >
              End Turn
            </Button>
          </Box>
        </Box>
        
        {isPlayerTurn && (
          <Alert severity="info" sx={{ mt: 2 }}>
            It's your turn! Make your moves and end your turn when you're ready.
          </Alert>
        )}
      </Paper>
      
      {/* Game Content */}
      <Grid container spacing={2}>
        {/* Left Column - Game Information */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Your Player
            </Typography>
            
            {player && (
              <Box>
                <Typography variant="subtitle1">{player.name}</Typography>
                <Typography variant="body2">Role: {player.role}</Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={`Karma: ${player.karma}`} 
                    color={player.karma > 0 ? 'success' : player.karma < 0 ? 'error' : 'default'}
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip 
                    label={`Resources: ${player.resources}`} 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                </Box>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Quests Completed: {player.stats.questsCompleted}
                </Typography>
                <Typography variant="body2">
                  Decisions Made: {player.stats.decisionsCount}
                </Typography>
                <Typography variant="body2">
                  Realms Controlled: {player.stats.realmsControlled}
                </Typography>
                <Typography variant="body2">
                  Time Rifts Resolved: {player.stats.timeRiftsResolved}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Current Player
            </Typography>
            
            {game.players[game.currentPlayerIndex] && (
              <Box>
                <Typography variant="subtitle1">
                  {game.players[game.currentPlayerIndex].name}
                </Typography>
                <Typography variant="body2">
                  Role: {game.players[game.currentPlayerIndex].role}
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => navigate(`/games/${gameId}/quests`)}
              sx={{ mb: 1 }}
            >
              View Quests
            </Button>
            
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => navigate(`/games/${gameId}/decisions`)}
            >
              Decision History
            </Button>
          </Paper>
        </Grid>
        
        {/* Main Content Area */}
        <Grid item xs={12} md={9}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab icon={<TimelineIcon />} label="Timelines" />
              <Tab icon={<PublicIcon />} label="Realms" />
              <Tab icon={<GroupIcon />} label="Players" />
              <Tab icon={<AccessTimeIcon />} label="Time Rifts" />
              <Tab icon={<SettingsIcon />} label="Game Settings" />
            </Tabs>
            
            {/* Tab Content */}
            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && (
                <TimelineView 
                  gameId={gameId} 
                  timelines={game.timelines || []} 
                  onRefresh={handleRefresh}
                />
              )}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6">Realms</Typography>
                  {/* Realm component will be implemented separately */}
                  <Typography variant="body2" color="text.secondary">
                    Realm view coming soon...
                  </Typography>
                </Box>
              )}
              
              {activeTab === 2 && (
                <PlayerList 
                  players={game.players || []} 
                  currentPlayerId={player?.id}
                  currentPlayerIndex={game.currentPlayerIndex}
                />
              )}
              
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6">Time Rifts</Typography>
                  {/* Time Rift component will be implemented separately */}
                  <Typography variant="body2" color="text.secondary">
                    Time Rift view coming soon...
                  </Typography>
                </Box>
              )}
              
              {activeTab === 4 && (
                <Box>
                  <Typography variant="h6">Game Settings</Typography>
                  <Typography variant="body2">
                    Game ID: {game.id}
                  </Typography>
                  <Typography variant="body2">
                    Join Code: {game.joinCode}
                  </Typography>
                  <Typography variant="body2">
                    Max Players: {game.maxPlayers}
                  </Typography>
                  <Typography variant="body2">
                    Created: {new Date(game.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
          
          {/* Game Chat */}
          <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
            <GameChat gameId={gameId} playerId={player?.id} />
          </Paper>
        </Grid>
      </Grid>
      
      {/* Game Controls */}
      <GameControls 
        gameId={gameId} 
        playerId={player?.id} 
        isPlayerTurn={isPlayerTurn}
        onEndTurn={handleEndTurn}
        onRefresh={handleRefresh}
      />
    </Box>
  );
};

export default GameDashboard;
