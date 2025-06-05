import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

import '../models/game.dart';
import '../models/player.dart';
import '../models/quest.dart';
import '../utils/api_exception.dart';
import 'auth_service.dart';

class GameService {
  final String baseUrl;
  final AuthService _authService;
  
  GameService({String? baseUrl, AuthService? authService}) 
      : this.baseUrl = baseUrl ?? dotenv.env['API_URL'] ?? 'http://localhost:5000/api',
        this._authService = authService ?? AuthService();

  // Get headers with auth token
  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Create a new game
  Future<Game> createGame(String name) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/games'),
        headers: headers,
        body: jsonEncode({
          'name': name,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return Game.fromJson(data['game']);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to create game');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Join a game using game code
  Future<Game> joinGame(String gameCode, PlayerRole role) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/games/join'),
        headers: headers,
        body: jsonEncode({
          'gameCode': gameCode,
          'role': role.name,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Game.fromJson(data['game']);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to join game');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Get game by ID
  Future<Game> getGameById(String gameId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/games/$gameId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Game.fromJson(data['game']);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to get game');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Get user's active games
  Future<List<Game>> getUserGames() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/games/user'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['games'] as List).map((game) => Game.fromJson(game)).toList();
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to get user games');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Start game (host only)
  Future<Game> startGame(String gameId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/games/$gameId/start'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Game.fromJson(data['game']);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to start game');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Set player ready status
  Future<Game> setPlayerReady(String gameId, bool isReady) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/games/$gameId/ready'),
        headers: headers,
        body: jsonEncode({
          'isReady': isReady,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Game.fromJson(data['game']);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to set ready status');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Move player to a new timeline node
  Future<Game> movePlayer(String gameId, String nodeId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/games/$gameId/move'),
        headers: headers,
        body: jsonEncode({
          'nodeId': nodeId,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Game.fromJson(data['game']);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to move player');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Complete a quest with a decision
  Future<Game> completeQuest(String gameId, String questId, String decisionId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/games/$gameId/quests/$questId/complete'),
        headers: headers,
        body: jsonEncode({
          'decisionId': decisionId,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Game.fromJson(data['game']);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to complete quest');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // End player turn
  Future<Game> endTurn(String gameId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/games/$gameId/end-turn'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return Game.fromJson(data['game']);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to end turn');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Leave game
  Future<void> leaveGame(String gameId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/games/$gameId/leave'),
        headers: headers,
      );

      if (response.statusCode != 200) {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to leave game');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }
}
