import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  InputAdornment
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import socketService from '../../services/socket.service';

/**
 * GameChat Component
 * Real-time chat for game participants
 */
const GameChat = ({ gameId, playerId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Connect to socket and listen for messages
  useEffect(() => {
    if (!gameId || !playerId || !user) return;

    // Join the game room
    socketService.joinGame(gameId);
    setConnected(true);

    // Listen for new messages
    socketService.on('game:message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for system messages
    socketService.on('game:system', (message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...message, isSystem: true }
      ]);
    });

    // Clean up on unmount
    return () => {
      socketService.off('game:message');
      socketService.off('game:system');
      socketService.leaveGame(gameId);
    };
  }, [gameId, playerId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !connected) return;

    const message = {
      gameId,
      playerId,
      sender: {
        id: user.id,
        name: user.username,
        avatar: user.avatar
      },
      content: messageInput.trim(),
      timestamp: new Date().toISOString()
    };

    // Emit the message
    socketService.emit('game:sendMessage', message);

    // Add to local state for immediate feedback
    setMessages((prevMessages) => [...prevMessages, message]);
    
    // Clear input
    setMessageInput('');
  };

  // Handle input change
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Game Chat
      </Typography>
      
      {/* Messages Container */}
      <Paper 
        variant="outlined" 
        sx={{ 
          flexGrow: 1, 
          mb: 2, 
          overflow: 'auto',
          bgcolor: 'background.default'
        }}
      >
        <List sx={{ padding: 0 }}>
          {messages.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              p: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            messages.map((message, index) => (
              <Box key={index}>
                {index > 0 && <Divider variant="inset" component="li" />}
                {message.isSystem ? (
                  <ListItem alignItems="center" sx={{ py: 1 }}>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        textAlign: 'center',
                        py: 0.5
                      }}
                    >
                      <Chip
                        label={message.content}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </ListItem>
                ) : (
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      py: 1,
                      bgcolor: message.sender.id === user.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        alt={message.sender.name} 
                        src={message.sender.avatar || '/default-avatar.png'} 
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography
                            variant="subtitle2"
                            color="text.primary"
                          >
                            {message.sender.name}
                            {message.sender.id === user.id && (
                              <Chip 
                                label="You" 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} 
                              />
                            )}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatTime(message.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}
                        >
                          {message.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      
      {/* Message Input */}
      <Box sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          value={messageInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={!connected}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || !connected}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
    </Box>
  );
};

export default GameChat;
