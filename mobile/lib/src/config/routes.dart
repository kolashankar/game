import 'package:flutter/material.dart';

import '../screens/splash_screen.dart';
import '../screens/login_screen.dart';
import '../screens/register_screen.dart';
import '../screens/home_screen.dart';
import '../screens/game_scanner_screen.dart';
import '../screens/ar_view_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/game_details_screen.dart';
import '../screens/game_board_screen.dart';
import '../screens/quest_details_screen.dart';

class Routes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String gameScanner = '/game-scanner';
  static const String arView = '/ar-view';
  static const String profile = '/profile';
  static const String settings = '/settings';
  static const String gameDetails = '/game-details';
  static const String gameBoard = '/game-board';
  static const String questDetails = '/quest-details';
  static const String timeline = '/timeline';
  static const String realmView = '/realm-view';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    final String? routeName = settings.name;
    
    // Using if-else instead of switch because we need to compare String? with String
    if (routeName == splash) {
      return MaterialPageRoute(builder: (_) => const SplashScreen());
    } else if (routeName == login) {
      return MaterialPageRoute(builder: (_) => const LoginScreen());
    } else if (routeName == register) {
      return MaterialPageRoute(builder: (_) => const RegisterScreen());
    } else if (routeName == home) {
      return MaterialPageRoute(builder: (_) => const HomeScreen());
    } else if (routeName == gameScanner) {
      return MaterialPageRoute(builder: (_) => const GameScannerScreen());
    } else if (routeName == arView) {
      final args = settings.arguments as Map<String, dynamic>?;
      return MaterialPageRoute(
        builder: (_) => ARViewScreen(
          isTimeline: args?['isTimeline'] as bool? ?? false,
          realmId: args?['realmId'] as String?,
          questId: args?['questId'] as String?,
        ),
      );
    } else if (routeName == profile) {
      return MaterialPageRoute(builder: (_) => const ProfileScreen());
    } else if (routeName == Routes.settings) {
      return MaterialPageRoute(builder: (_) => const SettingsScreen());
    } else if (routeName == gameDetails) {
      return MaterialPageRoute(builder: (_) => const GameDetailsScreen());
    } else if (routeName == gameBoard) {
      return MaterialPageRoute(builder: (_) => const GameBoardScreen());
    } else if (routeName == questDetails) {
      final args = settings.arguments as Map<String, dynamic>;
      return MaterialPageRoute(
        builder: (_) => QuestDetailsScreen(
          questId: args['questId'] as String,
        ),
      );
    } else if (routeName == timeline) {
      return MaterialPageRoute(builder: (_) => const Scaffold(body: Center(child: Text('Timeline Screen'))));
    } else if (routeName == realmView) {
      return MaterialPageRoute(builder: (_) => const Scaffold(body: Center(child: Text('Realm View Screen'))));
    } else {
      return MaterialPageRoute(
        builder: (_) => Scaffold(
          body: Center(
            child: Text('No route defined for ${settings.name}'),
          ),
        ),
      );
    }
  }
}
