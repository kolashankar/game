import 'package:flutter/foundation.dart';
import '../models/game.dart';
import '../models/player.dart';
import '../models/quest.dart';
import '../services/game_service.dart';

enum GameProviderStatus {
  initial,
  loading,
  loaded,
  error,
  joining,
  creating,
  starting,
  playing,
  ended
}

class GameProvider with ChangeNotifier {
  final GameService _gameService;
  
  GameProviderStatus _status = GameProviderStatus.initial;
  List<Game> _userGames = [];
  Game? _currentGame;
  String _errorMessage = '';
  bool _isLoadingGames = false;

  GameProvider(this._gameService);

  // Getters
  GameProviderStatus get status => _status;
  List<Game> get userGames => _userGames;
  Game? get currentGame => _currentGame;
  String get errorMessage => _errorMessage;
  bool get isLoadingGames => _isLoadingGames;

  // Load user's games
  Future<void> loadUserGames() async {
    try {
      _isLoadingGames = true;
      notifyListeners();
      
      final games = await _gameService.getUserGames();
      
      _userGames = games;
      _isLoadingGames = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoadingGames = false;
      notifyListeners();
    }
  }

  // Create a new game
  Future<bool> createGame(String name) async {
    try {
      _status = GameProviderStatus.creating;
      _errorMessage = '';
      notifyListeners();
      
      final game = await _gameService.createGame(name);
      
      _currentGame = game;
      _userGames.add(game);
      _status = GameProviderStatus.loaded;
      notifyListeners();
      return true;
    } catch (e) {
      _status = GameProviderStatus.error;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Join a game using game code
  Future<bool> joinGame(String gameCode, PlayerRole role) async {
    try {
      _status = GameProviderStatus.joining;
      _errorMessage = '';
      notifyListeners();
      
      final game = await _gameService.joinGame(gameCode, role);
      
      _currentGame = game;
      
      // Add to user games if not already there
      if (!_userGames.any((g) => g.id == game.id)) {
        _userGames.add(game);
      }
      
      _status = GameProviderStatus.loaded;
      notifyListeners();
      return true;
    } catch (e) {
      _status = GameProviderStatus.error;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Load game by ID
  Future<void> loadGame(String gameId) async {
    try {
      _status = GameProviderStatus.loading;
      _errorMessage = '';
      notifyListeners();
      
      final game = await _gameService.getGameById(gameId);
      
      _currentGame = game;
      
      // Update game status based on game state
      if (game.status == GameStatus.waiting) {
        _status = GameProviderStatus.loaded;
      } else if (game.status == GameStatus.inProgress) {
        _status = GameProviderStatus.playing;
      } else if (game.status == GameStatus.completed) {
        _status = GameProviderStatus.ended;
      } else {
        _status = GameProviderStatus.loaded;
      }
      
      notifyListeners();
    } catch (e) {
      _status = GameProviderStatus.error;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // Start game (host only)
  Future<bool> startGame() async {
    try {
      if (_currentGame == null) return false;
      
      _status = GameProviderStatus.starting;
      _errorMessage = '';
      notifyListeners();
      
      final game = await _gameService.startGame(_currentGame!.id);
      
      _currentGame = game;
      _status = GameProviderStatus.playing;
      
      // Update game in user games list
      final index = _userGames.indexWhere((g) => g.id == game.id);
      if (index >= 0) {
        _userGames[index] = game;
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _status = GameProviderStatus.error;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Set player ready status
  Future<bool> setPlayerReady(bool isReady) async {
    try {
      if (_currentGame == null) return false;
      
      final game = await _gameService.setPlayerReady(_currentGame!.id, isReady);
      
      _currentGame = game;
      
      // Update game in user games list
      final index = _userGames.indexWhere((g) => g.id == game.id);
      if (index >= 0) {
        _userGames[index] = game;
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Move player to a new timeline node
  Future<bool> movePlayer(String nodeId) async {
    try {
      if (_currentGame == null) return false;
      
      final game = await _gameService.movePlayer(_currentGame!.id, nodeId);
      
      _currentGame = game;
      
      // Update game in user games list
      final index = _userGames.indexWhere((g) => g.id == game.id);
      if (index >= 0) {
        _userGames[index] = game;
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Complete a quest with a decision
  Future<bool> completeQuest(String questId, String decisionId) async {
    try {
      if (_currentGame == null) return false;
      
      final game = await _gameService.completeQuest(_currentGame!.id, questId, decisionId);
      
      _currentGame = game;
      
      // Update game in user games list
      final index = _userGames.indexWhere((g) => g.id == game.id);
      if (index >= 0) {
        _userGames[index] = game;
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // End player turn
  Future<bool> endTurn() async {
    try {
      if (_currentGame == null) return false;
      
      final game = await _gameService.endTurn(_currentGame!.id);
      
      _currentGame = game;
      
      // Update game in user games list
      final index = _userGames.indexWhere((g) => g.id == game.id);
      if (index >= 0) {
        _userGames[index] = game;
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Leave game
  Future<bool> leaveGame() async {
    try {
      if (_currentGame == null) return false;
      
      final gameId = _currentGame!.id;
      await _gameService.leaveGame(gameId);
      
      // Remove game from user games list
      _userGames.removeWhere((g) => g.id == gameId);
      _currentGame = null;
      _status = GameProviderStatus.initial;
      
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Update current game (e.g., from socket updates)
  void updateCurrentGame(Game game) {
    _currentGame = game;
    
    // Update game in user games list
    final index = _userGames.indexWhere((g) => g.id == game.id);
    if (index >= 0) {
      _userGames[index] = game;
    }
    
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _errorMessage = '';
    notifyListeners();
  }

  // Clear current game
  void clearCurrentGame() {
    _currentGame = null;
    _status = GameProviderStatus.initial;
    notifyListeners();
  }

  // Refresh current game data
  Future<void> refreshCurrentGame() async {
    if (_currentGame == null) return;
    try {
      final game = await _gameService.getGameById(_currentGame!.id);
      _currentGame = game;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // Get quest details
  Future<Quest> getQuestDetails(String questId) async {
    try {
      if (_currentGame == null) {
        throw Exception('No active game');
      }
      
      // First try to find the quest in the current game
      final quest = _currentGame!.quests.firstWhere(
        (q) => q.id == questId,
        orElse: () => throw Exception('Quest not found'),
      );
      
      // If needed, you could fetch more detailed quest info from the server here
      // final detailedQuest = await _gameService.getQuestDetails(_currentGame!.id, questId);
      
      return quest;
    } catch (e) {
      throw Exception('Failed to load quest details: ${e.toString()}');
    }
  }

  // Make a decision for a quest
  Future<bool> makeQuestDecision(String questId, String decisionId) async {
    try {
      if (_currentGame == null) return false;
      
      final game = await _gameService.completeQuest(_currentGame!.id, questId, decisionId);
      
      _currentGame = game;
      
      // Update game in user games list
      final index = _userGames.indexWhere((g) => g.id == game.id);
      if (index >= 0) {
        _userGames[index] = game;
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
