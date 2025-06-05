import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface GameChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

/**
 * Game chat component for in-game communication
 */
const GameChat: React.FC<GameChatProps> = ({ messages = [], onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card p-4 flex flex-col h-[300px]">
      <h3 className="text-lg font-semibold mb-2">Game Chat</h3>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto mb-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === user?.username ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  message.sender === user?.username
                    ? 'bg-primary-900 text-primary-100'
                    : 'bg-dark-700 text-gray-200'
                }`}
              >
                {message.sender !== user?.username && (
                  <div className="font-semibold text-xs text-gray-400 mb-1">
                    {message.sender}
                  </div>
                )}
                <p>{message.content}</p>
                <div className="text-right text-xs mt-1 opacity-70">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          className="input flex-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default GameChat;
