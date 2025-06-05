import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Chip, 
  LinearProgress, 
  Divider, 
  Button,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import NatureIcon from '@mui/icons-material/Nature';
import MemoryIcon from '@mui/icons-material/Memory';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TerrainIcon from '@mui/icons-material/Terrain';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import BoltIcon from '@mui/icons-material/Bolt';
import SchoolIcon from '@mui/icons-material/School';
import InventoryIcon from '@mui/icons-material/Inventory';

/**
 * RealmDetails Component
 * Displays detailed information about a selected realm
 */
const RealmDetails = ({ realm, onInteract }) => {
  const theme = useTheme();

  if (!realm) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          Select a realm to view its details
        </Typography>
      </Paper>
    );
  }

  // Get icon based on realm type
  const getRealmIcon = (type) => {
    switch (type) {
      case 'Urban':
        return <LocationCityIcon />;
      case 'Natural':
        return <NatureIcon />;
      case 'Technological':
        return <MemoryIcon />;
      case 'Spiritual':
        return <AutoAwesomeIcon />;
      case 'Wasteland':
        return <TerrainIcon />;
      case 'Hybrid':
        return <DeviceHubIcon />;
      default:
        return <LocationCityIcon />;
    }
  };

  // Get color based on realm type
  const getRealmColor = (type) => {
    switch (type) {
      case 'Urban':
        return theme.palette.info.main;
      case 'Natural':
        return theme.palette.success.main;
      case 'Technological':
        return theme.palette.secondary.main;
      case 'Spiritual':
        return theme.palette.primary.main;
      case 'Wasteland':
        return theme.palette.error.main;
      case 'Hybrid':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Handle interaction with realm
  const handleInteract = (action) => {
    if (onInteract) {
      onInteract(realm.id, action);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box 
          sx={{ 
            p: 1.5, 
            borderRadius: '50%', 
            mr: 2,
            bgcolor: `${getRealmColor(realm.type)}20`,
            color: getRealmColor(realm.type)
          }}
        >
          {getRealmIcon(realm.type)}
        </Box>
        <Box>
          <Typography variant="h5" component="h2">
            {realm.name}
          </Typography>
          <Chip 
            label={realm.type} 
            size="small" 
            sx={{ 
              bgcolor: `${getRealmColor(realm.type)}20`,
              color: getRealmColor(realm.type),
              fontWeight: 'bold'
            }} 
          />
        </Box>
      </Box>

      <Typography variant="body1" paragraph>
        {realm.description || `A ${realm.type.toLowerCase()} realm with unique characteristics and challenges.`}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Development Level
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">Level {realm.developmentLevel}</Typography>
          <Typography variant="body2">{realm.developmentLevel}/5</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(realm.developmentLevel / 5) * 100} 
          sx={{ 
            height: 10, 
            borderRadius: 5,
            bgcolor: theme.palette.background.paper,
            '& .MuiLinearProgress-bar': {
              bgcolor: getRealmColor(realm.type)
            }
          }} 
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        Resources
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BoltIcon color="warning" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" color="textSecondary">
                  Energy
                </Typography>
              </Box>
              <Typography variant="h6">
                {realm.resources?.energy || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SchoolIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" color="textSecondary">
                  Knowledge
                </Typography>
              </Box>
              <Typography variant="h6">
                {realm.resources?.knowledge || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2" color="textSecondary">
                  Materials
                </Typography>
              </Box>
              <Typography variant="h6">
                {realm.resources?.materials || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Actions
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button 
            variant="outlined" 
            fullWidth
            onClick={() => handleInteract('influence')}
          >
            Influence
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button 
            variant="contained" 
            fullWidth
            onClick={() => handleInteract('decision')}
            color="primary"
          >
            Make Decision
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RealmDetails;
