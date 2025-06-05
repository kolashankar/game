import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  useTheme
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StarIcon from '@mui/icons-material/Star';
import playerService from '../../services/player.service';

/**
 * QuestCard Component
 * Displays a quest card with options for the player
 */
const QuestCard = ({ quest, playerId, onQuestComplete, onError }) => {
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

  if (!quest) return null;

  // Handle expand click
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Handle dialog open
  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedOption(null);
  };

  // Handle option selection
  const handleOptionSelect = (event) => {
    setSelectedOption(Number(event.target.value));
  };

  // Handle quest completion
  const handleCompleteQuest = async () => {
    if (!selectedOption) return;

    try {
      setSubmitting(true);
      
      // Complete the quest with selected option
      const response = await playerService.completeQuest(playerId, quest.id, selectedOption);
      
      // Close dialog
      handleDialogClose();
      
      // Notify parent component
      if (onQuestComplete) {
        onQuestComplete(response.data);
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      if (onError) {
        onError(error.response?.data?.message || 'Failed to complete quest');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Get color based on quest type
  const getQuestColor = (type) => {
    switch (type) {
      case 'Ethical':
        return theme.palette.primary.main;
      case 'Technical':
        return theme.palette.info.main;
      case 'Diplomatic':
        return theme.palette.success.main;
      case 'Temporal':
        return theme.palette.warning.main;
      default:
        return theme.palette.secondary.main;
    }
  };

  // Render difficulty stars
  const renderDifficultyStars = (difficulty) => {
    const stars = [];
    for (let i = 0; i < difficulty; i++) {
      stars.push(
        <StarIcon 
          key={i} 
          fontSize="small" 
          sx={{ 
            color: theme.palette.warning.main,
            fontSize: '0.8rem'
          }} 
        />
      );
    }
    return stars;
  };

  return (
    <>
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 2,
          borderLeft: `4px solid ${getQuestColor(quest.type)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 3
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="div">
              {quest.title}
            </Typography>
            <Chip 
              label={quest.type} 
              size="small" 
              sx={{ 
                bgcolor: `${getQuestColor(quest.type)}20`,
                color: getQuestColor(quest.type),
                fontWeight: 'bold'
              }} 
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Difficulty:
            </Typography>
            {renderDifficultyStars(quest.difficulty)}
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {quest.description}
          </Typography>
          
          <Button
            onClick={handleExpandClick}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mt: 1, p: 0, textTransform: 'none' }}
            color="inherit"
          >
            {expanded ? 'Hide Options' : 'View Options'}
          </Button>
          
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Available Options:
              </Typography>
              
              {quest.options.map((option, index) => (
                <Box key={option.id} sx={{ mb: index < quest.options.length - 1 ? 2 : 0 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Option {option.id}: {option.text}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Potential Outcome: {option.potential_outcome}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </CardContent>
        
        <CardActions>
          <Button 
            size="small" 
            variant="contained"
            startIcon={<HelpIcon />}
            onClick={handleDialogOpen}
            sx={{ ml: 'auto' }}
          >
            Respond to Quest
          </Button>
        </CardActions>
      </Card>
      
      {/* Quest Response Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {quest.title}
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            {quest.description}
          </DialogContentText>
          
          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Choose your response:
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="quest-options"
                name="quest-options"
                value={selectedOption}
                onChange={handleOptionSelect}
              >
                {quest.options.map((option) => (
                  <FormControlLabel
                    key={option.id}
                    value={option.id}
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body1">{option.text}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.potential_outcome}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
          
          {submitting && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleCompleteQuest} 
            variant="contained"
            disabled={!selectedOption || submitting}
            color="primary"
          >
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuestCard;
