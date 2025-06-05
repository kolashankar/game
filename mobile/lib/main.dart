import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'src/app.dart';
import 'src/services/auth_service.dart';
import 'src/services/game_service.dart';
import 'src/providers/auth_provider.dart';
import 'src/providers/game_provider.dart';
import 'src/utils/font_loader.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  await dotenv.load(fileName: ".env");
  
  // Configure services with correct API endpoints
  final authService = AuthService(baseUrl: 'http://localhost:5000/api');
  final gameService = GameService(baseUrl: 'http://localhost:5000/api');
  
  // Initialize Google Fonts
  GoogleFonts.config.allowRuntimeFetching = true;
  
  // Preload the fonts we'll use most frequently
  await GoogleFonts.pendingFonts([]);
  
  // Add a small delay to ensure fonts are loaded
  await Future.delayed(const Duration(milliseconds: 300));
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider(authService)),
        ChangeNotifierProvider(create: (_) => GameProvider(gameService)),
      ],
      child: const ChronoCoreApp(),
    ),
  );
}
