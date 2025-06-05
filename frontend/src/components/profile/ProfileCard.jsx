import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
  Divider,
  Grid,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GamesIcon from '@mui/icons-material/Games';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

/**
 * ProfileCard Component
 * Displays user profile information with edit capabilities
 */
const ProfileCard = ({ userStats }) => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errors, setErrors] = useState({});

  // Mock stats if not provided
  const stats = userStats || {
    gamesPlayed: 12,
    gamesWon: 5,
    questsCompleted: 37,
    decisionsCount: 124,
    timeRiftsResolved: 8,
    realmsControlled: 3,
    karma: 78,
    favoriteRole: 'Chrono Diplomat',
    joinDate: '2025-01-15T12:00:00Z'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, reset form data
      setFormData({
        username: user?.username || '',
        bio: user?.bio || '',
        avatar: user?.avatar || ''
      });
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to update profile'
      });
    }
  };

  const handleAvatarDialogOpen = () => {
    setAvatarUrl(formData.avatar);
    setAvatarDialogOpen(true);
  };

  const handleAvatarDialogClose = () => {
    setAvatarDialogOpen(false);
  };

  const handleAvatarUpdate = () => {
    setFormData({
      ...formData,
      avatar: avatarUrl
    });
    setAvatarDialogOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={formData.avatar || '/default-avatar.png'}
              alt={formData.username}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            {isEditing && (
              <IconButton
                color="primary"
                aria-label="change avatar"
                component="span"
                onClick={handleAvatarDialogOpen}
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 0,
                  backgroundColor: 'background.paper'
                }}
              >
                <PhotoCameraIcon />
              </IconButton>
            )}
          </Box>
          
          {isEditing ? (
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!errors.username}
              helperText={errors.username}
              sx={{ mb: 2, maxWidth: 300 }}
            />
          ) : (
            <Typography variant="h5" gutterBottom>
              {user?.username}
            </Typography>
          )}
          
          <Chip
            label={`Role: ${user?.role || 'User'}`}
            color="primary"
            variant="outlined"
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Bio
        </Typography>
        
        {isEditing ? (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            sx={{ mb: 2 }}
          />
        ) : (
          <Typography variant="body1" paragraph>
            {user?.bio || 'No bio provided.'}
          </Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Game Statistics
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GamesIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">Games Played</Typography>
            </Box>
            <Typography variant="h6">{stats.gamesPlayed}</Typography>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">Games Won</Typography>
            </Box>
            <Typography variant="h6">{stats.gamesWon}</Typography>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">Quests Completed</Typography>
            </Box>
            <Typography variant="h6">{stats.questsCompleted}</Typography>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Decisions Made</Typography>
            </Box>
            <Typography variant="h6">{stats.decisionsCount}</Typography>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Time Rifts Resolved</Typography>
            </Box>
            <Typography variant="h6">{stats.timeRiftsResolved}</Typography>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Realms Controlled</Typography>
            </Box>
            <Typography variant="h6">{stats.realmsControlled}</Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Chip
            label={`Karma: ${stats.karma}`}
            color={stats.karma > 50 ? 'success' : stats.karma < 0 ? 'error' : 'warning'}
            sx={{ fontWeight: 'bold' }}
          />
          
          <Chip
            label={`Favorite Role: ${stats.favoriteRole}`}
            variant="outlined"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Member since: {formatDate(stats.joinDate)}
        </Typography>
        
        {errors.submit && (
          <Typography color="error" sx={{ mt: 2 }}>
            {errors.submit}
          </Typography>
        )}
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        {isEditing ? (
          <>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleEditToggle}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              sx={{ ml: 1 }}
            >
              Save
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditToggle}
          >
            Edit Profile
          </Button>
        )}
      </CardActions>
      
      {/* Avatar Update Dialog */}
      <Dialog open={avatarDialogOpen} onClose={handleAvatarDialogClose}>
        <DialogTitle>Update Avatar</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Avatar URL"
            fullWidth
            variant="outlined"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
          {avatarUrl && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Avatar
                src={avatarUrl}
                alt="New Avatar"
                sx={{ width: 100, height: 100 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAvatarDialogClose}>Cancel</Button>
          <Button onClick={handleAvatarUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProfileCard;
