import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../services/ar_service.dart';
import '../widgets/loading_overlay.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _isDarkMode = true;
  bool _enableNotifications = true;
  bool _enableSounds = true;
  bool _enableVibration = true;
  bool _enableARFeatures = true;
  bool _isLoading = false;
  final ARService _arService = ARService();

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isDarkMode = prefs.getBool('isDarkMode') ?? true;
      _enableNotifications = prefs.getBool('enableNotifications') ?? true;
      _enableSounds = prefs.getBool('enableSounds') ?? true;
      _enableVibration = prefs.getBool('enableVibration') ?? true;
      _enableARFeatures = prefs.getBool('enableARFeatures') ?? true;
    });
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDarkMode', _isDarkMode);
    await prefs.setBool('enableNotifications', _enableNotifications);
    await prefs.setBool('enableSounds', _enableSounds);
    await prefs.setBool('enableVibration', _enableVibration);
    await prefs.setBool('enableARFeatures', _enableARFeatures);
  }

  Future<void> _clearARCache() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await _arService.clearARModelsCache();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('AR cache cleared successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to clear AR cache: ${e.toString()}')),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return LoadingOverlay(
      isLoading: _isLoading,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Settings'),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // App Logo
              Center(
                child: SvgPicture.asset(
                  'assets/images/logo.svg',
                  width: 200,
                  height: 100,
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Appearance Section
              _buildSectionHeader(context, 'Appearance'),
              
              SwitchListTile(
                title: const Text('Dark Mode'),
                subtitle: const Text('Enable dark theme for the app'),
                value: _isDarkMode,
                onChanged: (value) {
                  setState(() {
                    _isDarkMode = value;
                  });
                  _saveSettings();
                },
                secondary: const Icon(Icons.dark_mode),
              ),
              
              const Divider(),
              
              // Notifications Section
              _buildSectionHeader(context, 'Notifications'),
              
              SwitchListTile(
                title: const Text('Enable Notifications'),
                subtitle: const Text('Receive game updates and alerts'),
                value: _enableNotifications,
                onChanged: (value) {
                  setState(() {
                    _enableNotifications = value;
                  });
                  _saveSettings();
                },
                secondary: const Icon(Icons.notifications),
              ),
              
              const Divider(),
              
              // Sound & Haptics Section
              _buildSectionHeader(context, 'Sound & Haptics'),
              
              SwitchListTile(
                title: const Text('Enable Sounds'),
                subtitle: const Text('Play sounds during gameplay'),
                value: _enableSounds,
                onChanged: (value) {
                  setState(() {
                    _enableSounds = value;
                  });
                  _saveSettings();
                },
                secondary: const Icon(Icons.volume_up),
              ),
              
              SwitchListTile(
                title: const Text('Enable Vibration'),
                subtitle: const Text('Haptic feedback for interactions'),
                value: _enableVibration,
                onChanged: (value) {
                  setState(() {
                    _enableVibration = value;
                  });
                  _saveSettings();
                },
                secondary: const Icon(Icons.vibration),
              ),
              
              const Divider(),
              
              // AR Features Section
              _buildSectionHeader(context, 'AR Features'),
              
              SwitchListTile(
                title: const Text('Enable AR Features'),
                subtitle: const Text('Use augmented reality for enhanced gameplay'),
                value: _enableARFeatures,
                onChanged: (value) {
                  setState(() {
                    _enableARFeatures = value;
                  });
                  _saveSettings();
                },
                secondary: const Icon(Icons.view_in_ar),
              ),
              
              ListTile(
                title: const Text('Clear AR Cache'),
                subtitle: const Text('Free up space by clearing cached AR models'),
                leading: const Icon(Icons.cleaning_services),
                onTap: _clearARCache,
              ),
              
              const Divider(),
              
              // About Section
              _buildSectionHeader(context, 'About'),
              
              ListTile(
                title: const Text('App Version'),
                subtitle: const Text('1.0.0'),
                leading: const Icon(Icons.info),
              ),
              
              ListTile(
                title: const Text('Terms of Service'),
                leading: const Icon(Icons.description),
                onTap: () {
                  // TODO: Navigate to Terms of Service
                },
              ),
              
              ListTile(
                title: const Text('Privacy Policy'),
                leading: const Icon(Icons.privacy_tip),
                onTap: () {
                  // TODO: Navigate to Privacy Policy
                },
              ),
              
              const SizedBox(height: 32),
              
              // App Info
              Center(
                child: Column(
                  children: [
                    Text(
                      'ChronoCore Companion',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '© 2025 ChronoCore Games',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleLarge?.copyWith(
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }
}
