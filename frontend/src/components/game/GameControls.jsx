import { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PublicIcon from '@mui/icons-material/Public';
import WarningIcon from '@mui/icons-material/Warning';
import HelpIcon from '@mui/icons-material/Help';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import gameService from '../../services/game.service';
import playerService from '../../services/player.service';

/**
 * GameControls Component
 * Provides action buttons for game interactions
 */
const GameControls = ({ gameId, playerId, isPlayerTurn, onEndTurn, onRefresh }) => {
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [questDialogOpen, setQuestDialogOpen] = useState(false);
  const [decisionText, setDecisionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle speed dial open/close
  const handleSpeedDialToggle = () => {
    setSpeedDialOpen(!speedDialOpen);
  };

  // Handle speed dial close
  const handleSpeedDialClose = () => {
    setSpeedDialOpen(false);
  };

  // Handle decision dialog open
  const handleDecisionDialogOpen = () => {
    setDecisionDialogOpen(true);
    handleSpeedDialClose();
  };

  // Handle decision dialog close
  const handleDecisionDialogClose = () => {
    setDecisionDialogOpen(false);
    setDecisionText('');
  };

  // Handle quest dialog open
  const handleQuestDialogOpen = () => {
    setQuestDialogOpen(true);
    handleSpeedDialClose();
  };

  // Handle quest dialog close
  const handleQuestDialogClose = () => {
    setQuestDialogOpen(false);
  };

  // Handle decision text change
  const handleDecisionTextChange = (e) => {
    setDecisionText(e.target.value);
  };

  // Handle making a decision
  const handleMakeDecision = async () => {
    if (!decisionText.trim()) return;

    try {
      setLoading(true);
      
      // Create decision context
      const context = {
        gameId,
        turn: true, // This would come from the game state
        type: 'player_decision'
      };
      
      // Make the decision
      await playerService.makeDecision(playerId, decisionText, context);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Decision submitted successfully!',
        severity: 'success'
      });
      
      // Close dialog and refresh
      handleDecisionDialogClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error making decision:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit decision',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle requesting a quest
  const handleRequestQuest = async () => {
    try {
      setLoading(true);
      
      // Request a new quest
      await playerService.requestQuest(playerId);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'New quest received!',
        severity: 'success'
      });
      
      // Close dialog and refresh
      handleQuestDialogClose();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error requesting quest:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to request quest',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Speed dial actions
  const actions = [
    { icon: <AccessTimeIcon />, name: 'Make Decision', onClick: handleDecisionDialogOpen },
    { icon: <HelpIcon />, name: 'Request Quest', onClick: handleQuestDialogOpen },
    { icon: <PublicIcon />, name: 'View Realms', onClick: () => {} },
    { icon: <WarningIcon />, name: 'View Time Rifts', onClick: () => {} }
  ];

  return (
    <>
      {/* Fixed action button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
      >
        {isPlayerTurn ? (
          <Box sx={{ position: 'relative', height: 320 }}>
            <SpeedDial
              ariaLabel="Game Actions"
              icon={<SpeedDialIcon />}
              onClose={handleSpeedDialClose}
              onOpen={handleSpeedDialToggle}
              open={speedDialOpen}
              direction="up"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0
              }}
            >
              {actions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  tooltipOpen
                  onClick={action.onClick}
                />
              ))}
            </SpeedDial>
          </Box>
        ) : (
          <Fab
            color="primary"
            aria-label="refresh"
            onClick={onRefresh}
          >
            <RefreshIcon />
          </Fab>
        )}
      </Box>

      {/* Decision Dialog */}
      <Dialog
        open={decisionDialogOpen}
        onClose={handleDecisionDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Make a Decision</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your decisions shape the future of timelines and realms. Choose wisely as your actions have consequences.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="decision"
            label="Your Decision"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={decisionText}
            onChange={handleDecisionTextChange}
            disabled={loading}
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Describe your decision in detail. The AI will evaluate its ethical, technological, and temporal impacts.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDecisionDialogClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleMakeDecision} 
            variant="contained" 
            disabled={!decisionText.trim() || loading}
            startIcon={<SendIcon />}
          >
            {loading ? 'Submitting...' : 'Submit Decision'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quest Dialog */}
      <Dialog
        open={questDialogOpen}
        onClose={handleQuestDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Request a New Quest</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Quests provide challenges and opportunities to influence the game world. Would you like to request a new quest?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQuestDialogClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleRequestQuest} 
            variant="contained" 
            disabled={loading}
            color="secondary"
          >
            {loading ? 'Requesting...' : 'Request Quest'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GameControls;
