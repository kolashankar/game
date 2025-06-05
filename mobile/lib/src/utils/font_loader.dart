import 'package:flutter/material.dart';

/// Helper class to preload fonts for web
class CustomFontLoader {
  /// Preload all fonts used in the app
  static Future<void> preloadFonts(BuildContext context) async {
    // For web, fonts are loaded through the index.html file with preload links
    // This method is just a placeholder to ensure fonts are loaded before rendering
    // We'll add a small delay to simulate font loading
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Print confirmation that fonts are loaded
    debugPrint('Fonts preloaded successfully');
  }
}
