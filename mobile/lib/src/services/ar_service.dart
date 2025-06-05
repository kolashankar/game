import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

import '../models/realm.dart';
import '../models/quest.dart';
import '../utils/api_exception.dart';
import 'auth_service.dart';

class ARService {
  final String baseUrl = dotenv.env['API_URL'] ?? 'https://game-ujiz.onrender.com/api';
  final AuthService _authService = AuthService();
  
  // Get headers with auth token
  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Get AR models for a specific realm
  Future<Map<String, dynamic>> getRealmARModels(String realmId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/ar/realms/$realmId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to get AR models');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Get AR models for a specific quest
  Future<Map<String, dynamic>> getQuestARModels(String questId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/ar/quests/$questId'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to get AR models');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Download AR model file
  Future<File> downloadARModel(String modelUrl, String fileName) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse(modelUrl),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/ar_models/$fileName';
        
        // Create directory if it doesn't exist
        final modelDir = Directory('${directory.path}/ar_models');
        if (!await modelDir.exists()) {
          await modelDir.create(recursive: true);
        }
        
        final file = File(filePath);
        await file.writeAsBytes(response.bodyBytes);
        return file;
      } else {
        throw ApiException('Failed to download AR model', statusCode: response.statusCode);
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Get local path for cached AR models
  Future<String> getARModelsCachePath() async {
    final directory = await getApplicationDocumentsDirectory();
    final path = '${directory.path}/ar_models';
    
    final dir = Directory(path);
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    
    return path;
  }

  // Clear AR models cache
  Future<void> clearARModelsCache() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final path = '${directory.path}/ar_models';
      
      final dir = Directory(path);
      if (await dir.exists()) {
        await dir.delete(recursive: true);
      }
    } catch (e) {
      throw ApiException('Failed to clear AR models cache: ${e.toString()}');
    }
  }

  // Get AR visualization for a timeline
  Future<Map<String, dynamic>> getTimelineARVisualization(String gameId) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/ar/games/$gameId/timeline'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        throw ApiException(error['message'] ?? 'Failed to get timeline visualization');
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: ${e.toString()}');
    }
  }

  // Process QR code for game joining
  Future<String> processQRCode(String qrData) async {
    try {
      // Validate QR code format
      if (!qrData.startsWith('chronocore://game/')) {
        throw ApiException('Invalid QR code format');
      }
      
      // Extract game code
      final gameCode = qrData.substring('chronocore://game/'.length);
      return gameCode;
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Failed to process QR code: ${e.toString()}');
    }
  }
}
