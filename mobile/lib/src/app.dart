import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'config/routes.dart';
import 'config/theme.dart';
import 'providers/auth_provider.dart';

class ChronoCoreApp extends StatefulWidget {
  const ChronoCoreApp({Key? key}) : super(key: key);

  @override
  State<ChronoCoreApp> createState() => _ChronoCoreAppState();
}

class _ChronoCoreAppState extends State<ChronoCoreApp> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    // We'll always return the main app and let Google Fonts handle the font loading
    // This avoids the null error we were seeing
    return MaterialApp(
      title: 'ChronoCore Companion',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.dark,
      initialRoute: Routes.splash,
      onGenerateRoute: Routes.generateRoute,
      debugShowCheckedModeBanner: false,
    );
  }
}
