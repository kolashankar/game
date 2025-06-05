import { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * PlayerList Component
 * Displays a list of players in a game
 */
const PlayerList = ({ players, currentPlayerId, currentPlayerIndex }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Sort players: current player first, then current turn player, then others
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.id === currentPlayerId) return -1;
    if (b.id === currentPlayerId) return 1;
    if (players[currentPlayerIndex]?.id === a.id) return -1;
    if (players[currentPlayerIndex]?.id === b.id) return 1;
    return 0;
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Players ({players.length})
      </Typography>
      
      <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
        <List sx={{ width: '100%' }}>
          {sortedPlayers.map((player, index) => (
            <Box key={player.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <IconButton edge="end" onClick={() => handlePlayerClick(player)}>
                    <InfoIcon />
                  </IconButton>
                }
                sx={{
                  backgroundColor: 
                    player.id === currentPlayerId 
                      ? 'rgba(0, 0, 0, 0.04)' 
                      : players[currentPlayerIndex]?.id === player.id 
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'transparent'
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    alt={player.name} 
                    src={player.avatar || '/default-avatar.png'}
                    sx={{ 
                      border: players[currentPlayerIndex]?.id === player.id 
                        ? '2px solid #1976d2' 
                        : 'none'
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        component="span"
                        variant="subtitle1"
                        color="text.primary"
                      >
                        {player.name}
                      </Typography>
                      {player.id === currentPlayerId && (
                        <Chip 
                          label="You" 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1 }}
                        />
                      )}
                      {players[currentPlayerIndex]?.id === player.id && (
                        <Chip 
                          icon={<AccessTimeIcon />}
                          label="Current Turn" 
                          size="small" 
                          color="secondary" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {player.role}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={`Karma: ${player.karma}`}
                          size="small"
                          color={player.karma > 0 ? 'success' : player.karma < 0 ? 'error' : 'default'}
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                        <Chip
                          label={`Resources: ${player.resources}`}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5 }}
                        />
                      </Box>
                    </>
                  }
                />
              </ListItem>
            </Box>
          ))}
        </List>
      </Paper>

      {/* Player Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedPlayer && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={selectedPlayer.avatar || '/default-avatar.png'} 
                  alt={selectedPlayer.name}
                  sx={{ mr: 2, width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="h6">{selectedPlayer.name}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {selectedPlayer.role}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Player Stats
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    label={`Karma: ${selectedPlayer.karma}`}
                    color={selectedPlayer.karma > 0 ? 'success' : selectedPlayer.karma < 0 ? 'error' : 'default'}
                  />
                  <Chip
                    label={`Resources: ${selectedPlayer.resources}`}
                    variant="outlined"
                  />
                  <Chip
                    label={`Realms: ${selectedPlayer.stats?.realmsControlled || 0}`}
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Achievements
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <StarIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Quests Completed"
                    secondary={selectedPlayer.stats?.questsCompleted || 0}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <AccessTimeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Time Rifts Resolved"
                    secondary={selectedPlayer.stats?.timeRiftsResolved || 0}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <InfoIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Decisions Made"
                    secondary={selectedPlayer.stats?.decisionsCount || 0}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>
                Player Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={selectedPlayer.isActive ? 'Active' : 'Inactive'}
                  color={selectedPlayer.isActive ? 'success' : 'error'}
                  variant="outlined"
                />
                <Chip
                  label={selectedPlayer.isReady ? 'Ready' : 'Not Ready'}
                  color={selectedPlayer.isReady ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PlayerList;
