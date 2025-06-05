import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '../models/game.dart';
import '../services/notification_service.dart';

class SocketService {
  // Singleton pattern
  static final SocketService _instance = SocketService._internal();
  
  factory SocketService() {
    return _instance;
  }
  
  SocketService._internal();
  
  // Socket instance
  io.Socket? _socket;
  
  // Stream controllers for different event types
  final _gameUpdateController = StreamController<Game>.broadcast();
  final _playerJoinedController = StreamController<Map<String, dynamic>>.broadcast();
  final _playerLeftController = StreamController<Map<String, dynamic>>.broadcast();
  final _gameStartedController = StreamController<Game>.broadcast();
  final _turnChangedController = StreamController<Map<String, dynamic>>.broadcast();
  final _questUpdateController = StreamController<Map<String, dynamic>>.broadcast();
  final _chatMessageController = StreamController<Map<String, dynamic>>.broadcast();
  final _errorController = StreamController<String>.broadcast();
  
  // Notification service
  final _notificationService = NotificationService();
  
  // Streams
  Stream<Game> get onGameUpdate => _gameUpdateController.stream;
  Stream<Map<String, dynamic>> get onPlayerJoined => _playerJoinedController.stream;
  Stream<Map<String, dynamic>> get onPlayerLeft => _playerLeftController.stream;
  Stream<Game> get onGameStarted => _gameStartedController.stream;
  Stream<Map<String, dynamic>> get onTurnChanged => _turnChangedController.stream;
  Stream<Map<String, dynamic>> get onQuestUpdate => _questUpdateController.stream;
  Stream<Map<String, dynamic>> get onChatMessage => _chatMessageController.stream;
  Stream<String> get onError => _errorController.stream;
  
  // Connection status
  bool get isConnected => _socket?.connected ?? false;
  
  // Initialize socket connection
  void init(String token) {
    try {
      final socketUrl = dotenv.env['SOCKET_URL'] ?? 'https://game-ujiz.onrender.com';
      
      _socket = io.io(
        socketUrl,
        io.OptionBuilder()
            .setTransports(['websocket'])
            .disableAutoConnect()
            .setQuery({'token': token})
            .build(),
      );
      
      _setupSocketListeners();
      
      _socket?.connect();
    } catch (e) {
      debugPrint('Socket initialization error: $e');
      _errorController.add('Failed to connect to game server');
    }
  }
  
  // Setup socket event listeners
  void _setupSocketListeners() {
    _socket?.onConnect((_) {
      debugPrint('Socket connected');
    });
    
    _socket?.onDisconnect((_) {
      debugPrint('Socket disconnected');
    });
    
    _socket?.onConnectError((error) {
      debugPrint('Socket connection error: $error');
      _errorController.add('Connection error: Please check your internet connection');
    });
    
    _socket?.onError((error) {
      debugPrint('Socket error: $error');
      _errorController.add('Socket error occurred');
    });
    
    // Game-specific events
    _socket?.on('game:update', (data) {
      try {
        final game = Game.fromJson(data);
        _gameUpdateController.add(game);
      } catch (e) {
        debugPrint('Error parsing game update: $e');
      }
    });
    
    _socket?.on('game:player_joined', (data) {
      _playerJoinedController.add(data);
    });
    
    _socket?.on('game:player_left', (data) {
      _playerLeftController.add(data);
    });
    
    _socket?.on('game:started', (data) {
      try {
        final game = Game.fromJson(data);
        _gameStartedController.add(game);
        
        // Show notification
        _notificationService.showGameStartedNotification(
          gameId: game.id,
          gameName: game.name,
        );
      } catch (e) {
        debugPrint('Error parsing game started event: $e');
      }
    });
    
    _socket?.on('game:turn_changed', (data) {
      _turnChangedController.add(data);
      
      // Check if it's the current user's turn
      final isCurrentUserTurn = data['isCurrentUserTurn'] ?? false;
      if (isCurrentUserTurn) {
        _notificationService.showTurnNotification(
          gameId: data['gameId'],
          gameName: data['gameName'],
        );
      }
    });
    
    _socket?.on('game:quest_update', (data) {
      _questUpdateController.add(data);
      
      // Show notification for quest updates
      _notificationService.showQuestUpdateNotification(
        gameId: data['gameId'],
        questId: data['questId'],
        questTitle: data['questTitle'],
      );
    });
    
    _socket?.on('chat:message', (data) {
      _chatMessageController.add(data);
    });
  }
  
  // Join a game room
  void joinGame(String gameId) {
    if (!isConnected) {
      _errorController.add('Not connected to server');
      return;
    }
    
    _socket?.emit('game:join', {'gameId': gameId});
  }
  
  // Leave a game room
  void leaveGame(String gameId) {
    if (!isConnected) return;
    
    _socket?.emit('game:leave', {'gameId': gameId});
  }
  
  // Set player ready status
  void setPlayerReady(String gameId, bool isReady) {
    if (!isConnected) {
      _errorController.add('Not connected to server');
      return;
    }
    
    _socket?.emit('game:set_ready', {
      'gameId': gameId,
      'isReady': isReady,
    });
  }
  
  // Start a game
  void startGame(String gameId) {
    if (!isConnected) {
      _errorController.add('Not connected to server');
      return;
    }
    
    _socket?.emit('game:start', {'gameId': gameId});
  }
  
  // End the current turn
  void endTurn(String gameId) {
    if (!isConnected) {
      _errorController.add('Not connected to server');
      return;
    }
    
    _socket?.emit('game:end_turn', {'gameId': gameId});
  }
  
  // Make a decision in a quest
  void makeQuestDecision(String gameId, String questId, String decisionId) {
    if (!isConnected) {
      _errorController.add('Not connected to server');
      return;
    }
    
    _socket?.emit('game:quest_decision', {
      'gameId': gameId,
      'questId': questId,
      'decisionId': decisionId,
    });
  }
  
  // Send a chat message
  void sendChatMessage(String gameId, String message) {
    if (!isConnected) {
      _errorController.add('Not connected to server');
      return;
    }
    
    _socket?.emit('chat:message', {
      'gameId': gameId,
      'message': message,
    });
  }
  
  // Disconnect socket
  void disconnect() {
    _socket?.disconnect();
  }
  
  // Dispose resources
  void dispose() {
    _socket?.dispose();
    _gameUpdateController.close();
    _playerJoinedController.close();
    _playerLeftController.close();
    _gameStartedController.close();
    _turnChangedController.close();
    _questUpdateController.close();
    _chatMessageController.close();
    _errorController.close();
  }
}
