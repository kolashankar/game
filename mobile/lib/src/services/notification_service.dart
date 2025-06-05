import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class NotificationService {
  final FlutterLocalNotificationsPlugin _flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();
  
  // Singleton pattern
  static final NotificationService _instance = NotificationService._internal();
  
  factory NotificationService() {
    return _instance;
  }
  
  NotificationService._internal();
  
  Future<void> init() async {
    // Initialize settings for Android
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    // Initialize settings for iOS
    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    // Initialize settings for all platforms
    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );
    
    // Initialize the plugin
    await _flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
  }
  
  void _onNotificationTapped(NotificationResponse response) {
    // Handle notification tap
    if (response.payload != null) {
      try {
        final Map<String, dynamic> payload = jsonDecode(response.payload!);
        
        // Handle different notification types
        switch (payload['type']) {
          case 'game_invitation':
            // TODO: Navigate to game invitation screen
            break;
          case 'game_started':
            // TODO: Navigate to game board screen
            break;
          case 'turn_notification':
            // TODO: Navigate to game board screen
            break;
          case 'quest_update':
            // TODO: Navigate to quest details screen
            break;
          default:
            // Default action
            break;
        }
      } catch (e) {
        debugPrint('Error parsing notification payload: $e');
      }
    }
  }
  
  Future<bool> isNotificationsEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('enableNotifications') ?? true;
  }
  
  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
    String channelId = 'default_channel',
    String channelName = 'Default Channel',
    String channelDescription = 'Default notification channel',
    NotificationDetails? notificationDetails,
  }) async {
    // Check if notifications are enabled
    final enabled = await isNotificationsEnabled();
    if (!enabled) {
      return;
    }
    
    // Default notification details if not provided
    notificationDetails ??= NotificationDetails(
      android: AndroidNotificationDetails(
        channelId,
        channelName,
        channelDescription: channelDescription,
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
      ),
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      ),
    );
    
    // Show notification
    await _flutterLocalNotificationsPlugin.show(
      id,
      title,
      body,
      notificationDetails,
      payload: payload,
    );
  }
  
  Future<void> showGameInvitationNotification({
    required String gameId,
    required String gameName,
    required String hostName,
  }) async {
    final payload = jsonEncode({
      'type': 'game_invitation',
      'gameId': gameId,
      'gameName': gameName,
    });
    
    await showNotification(
      id: 1,
      title: 'Game Invitation',
      body: '$hostName has invited you to join $gameName',
      payload: payload,
      channelId: 'game_invitations',
      channelName: 'Game Invitations',
      channelDescription: 'Notifications for game invitations',
    );
  }
  
  Future<void> showGameStartedNotification({
    required String gameId,
    required String gameName,
  }) async {
    final payload = jsonEncode({
      'type': 'game_started',
      'gameId': gameId,
      'gameName': gameName,
    });
    
    await showNotification(
      id: 2,
      title: 'Game Started',
      body: '$gameName has started',
      payload: payload,
      channelId: 'game_updates',
      channelName: 'Game Updates',
      channelDescription: 'Notifications for game updates',
    );
  }
  
  Future<void> showTurnNotification({
    required String gameId,
    required String gameName,
  }) async {
    final payload = jsonEncode({
      'type': 'turn_notification',
      'gameId': gameId,
      'gameName': gameName,
    });
    
    await showNotification(
      id: 3,
      title: 'Your Turn',
      body: 'It\'s your turn in $gameName',
      payload: payload,
      channelId: 'turn_notifications',
      channelName: 'Turn Notifications',
      channelDescription: 'Notifications for player turns',
    );
  }
  
  Future<void> showQuestUpdateNotification({
    required String gameId,
    required String questId,
    required String questTitle,
  }) async {
    final payload = jsonEncode({
      'type': 'quest_update',
      'gameId': gameId,
      'questId': questId,
    });
    
    await showNotification(
      id: 4,
      title: 'Quest Update',
      body: 'New update for quest: $questTitle',
      payload: payload,
      channelId: 'quest_updates',
      channelName: 'Quest Updates',
      channelDescription: 'Notifications for quest updates',
    );
  }
  
  Future<void> cancelNotification(int id) async {
    await _flutterLocalNotificationsPlugin.cancel(id);
  }
  
  Future<void> cancelAllNotifications() async {
    await _flutterLocalNotificationsPlugin.cancelAll();
  }
}
