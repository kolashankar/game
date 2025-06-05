import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import TimelineIcon from '@mui/icons-material/Timeline';
import PublicIcon from '@mui/icons-material/Public';
import VisibilityIcon from '@mui/icons-material/Visibility';
import timelineService from '../../services/timeline.service';
import realmService from '../../services/realm.service';

/**
 * TimelineView Component
 * Displays timelines and allows interaction with them
 */
const TimelineView = ({ gameId, timelines = [], onRefresh }) => {
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [realms, setRealms] = useState([]);
  const [timeRifts, setTimeRifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load realms and time rifts when a timeline is selected
  useEffect(() => {
    const loadTimelineDetails = async () => {
      if (!selectedTimeline) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Load realms for the selected timeline
        const realmsData = await realmService.getTimelineRealms(selectedTimeline.id);
        setRealms(realmsData);
        
        // Load time rifts for the selected timeline
        const timeRiftsData = selectedTimeline.timeRifts || [];
        setTimeRifts(timeRiftsData);
      } catch (err) {
        console.error('Error loading timeline details:', err);
        setError(err.response?.data?.message || 'Failed to load timeline details');
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedTimeline) {
      loadTimelineDetails();
    }
  }, [selectedTimeline]);

  const handleTimelineClick = (timeline) => {
    setSelectedTimeline(timeline);
    setTimelineDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setTimelineDialogOpen(false);
  };

  // Get stability color based on value
  const getStabilityColor = (stability) => {
    if (stability >= 70) return 'success';
    if (stability >= 40) return 'warning';
    return 'error';
  };

  // Get stability text based on value
  const getStabilityText = (stability) => {
    if (stability >= 70) return 'Stable';
    if (stability >= 40) return 'Unstable';
    return 'Critical';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Timelines ({timelines.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          size="small"
        >
          Create Timeline
        </Button>
      </Box>

      {timelines.length === 0 ? (
        <Alert severity="info">
          No timelines available. Create a new timeline to get started.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {timelines.map((timeline) => (
            <Grid item xs={12} sm={6} md={4} key={timeline.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              >
                {/* Timeline stability indicator */}
                <Box sx={{ px: 2, pt: 2, pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" component="div">
                      {timeline.name}
                    </Typography>
                    <Chip 
                      label={getStabilityText(timeline.stability)} 
                      color={getStabilityColor(timeline.stability)}
                      size="small"
                    />
                  </Box>
                  <Tooltip title={`Stability: ${timeline.stability}%`}>
                    <LinearProgress 
                      variant="determinate" 
                      value={timeline.stability} 
                      color={getStabilityColor(timeline.stability)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Tooltip>
                </Box>
                
                <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {timeline.description || 'No description available.'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <PublicIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {timeline.realms?.length || 0} Realms
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WarningIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 0.5, 
                          color: timeline.timeRifts?.filter(r => !r.resolved).length > 0 ? 'error.main' : 'text.secondary' 
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        color={timeline.timeRifts?.filter(r => !r.resolved).length > 0 ? 'error.main' : 'text.secondary'}
                      >
                        {timeline.timeRifts?.filter(r => !r.resolved).length || 0} Rifts
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleTimelineClick(timeline)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Timeline Details Dialog */}
      <Dialog 
        open={timelineDialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        {selectedTimeline && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">{selectedTimeline.name}</Typography>
                </Box>
                <Chip 
                  label={`Stability: ${selectedTimeline.stability}%`} 
                  color={getStabilityColor(selectedTimeline.stability)}
                />
              </Box>
            </DialogTitle>
            
            <DialogContent dividers>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : (
                <>
                  <Typography variant="body1" paragraph>
                    {selectedTimeline.description || 'No description available.'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Realms
                  </Typography>
                  
                  {realms.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No realms in this timeline.
                    </Alert>
                  ) : (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {realms.map((realm) => (
                        <Grid item xs={12} sm={6} md={4} key={realm.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1">{realm.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {realm.owner ? `Controlled by: ${realm.owner.name}` : 'Uncontrolled'}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  label={`Development: ${realm.developmentLevel}`} 
                                  size="small" 
                                  sx={{ mr: 0.5, mb: 0.5 }} 
                                />
                                <Chip 
                                  label={`Resources: ${realm.resources}`} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ mb: 0.5 }} 
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Time Rifts
                  </Typography>
                  
                  {timeRifts.length === 0 ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      No time rifts detected in this timeline.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {timeRifts.map((rift) => (
                        <Grid item xs={12} sm={6} key={rift.id}>
                          <Card 
                            variant="outlined"
                            sx={{ 
                              borderColor: rift.resolved ? 'success.main' : 'error.main',
                              bgcolor: rift.resolved ? 'success.light' : 'error.light',
                              opacity: rift.resolved ? 0.8 : 1
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1">
                                  Time Rift {rift.id.substring(0, 8)}
                                </Typography>
                                <Chip 
                                  label={rift.resolved ? 'Resolved' : 'Active'} 
                                  color={rift.resolved ? 'success' : 'error'}
                                  size="small"
                                />
                              </Box>
                              <Typography variant="body2">
                                {rift.description || 'No description available.'}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip 
                                  label={`Severity: ${rift.severity}`} 
                                  size="small" 
                                  sx={{ mr: 0.5, mb: 0.5 }} 
                                />
                                {rift.resolvedById && (
                                  <Chip 
                                    label={`Resolved by: ${rift.resolvedById}`} 
                                    size="small" 
                                    color="success" 
                                    sx={{ mb: 0.5 }} 
                                  />
                                )}
                              </Box>
                            </CardContent>
                            {!rift.resolved && (
                              <CardActions>
                                <Button size="small" color="primary">
                                  Resolve Rift
                                </Button>
                              </CardActions>
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </>
              )}
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

export default TimelineView;
