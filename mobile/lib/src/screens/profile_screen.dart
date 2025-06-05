import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../utils/asset_helper.dart';

import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/loading_overlay.dart';
import '../models/player.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _usernameController;
  late TextEditingController _emailController;
  PlayerRole _selectedRole = PlayerRole.technoMonk;
  bool _isEditing = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.currentUser;
    
    _usernameController = TextEditingController(text: user?.username);
    _emailController = TextEditingController(text: user?.email);
    
    if (user?.preferredRole != null) {
      try {
        _selectedRole = PlayerRole.values.firstWhere(
          (role) => role.name == user!.preferredRole,
        );
      } catch (_) {
        // Default to technoMonk if preferred role is not found
        _selectedRole = PlayerRole.technoMonk;
      }
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isSaving = true;
      });
      
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      final success = await authProvider.updateProfile({
        'username': _usernameController.text.trim(),
        'preferredRole': _selectedRole.name,
      });
      
      setState(() {
        _isSaving = false;
        if (success) {
          _isEditing = false;
        }
      });
    }
  }

  String _getRoleDescription(PlayerRole role) {
    switch (role) {
      case PlayerRole.technoMonk:
        return 'Masters of technology who can manipulate digital systems and enhance technological progress.';
      case PlayerRole.shadowBroker:
        return 'Manipulators of information who excel at gathering intelligence and influencing decisions from the shadows.';
      case PlayerRole.chronoDiplomat:
        return 'Skilled negotiators who can forge alliances across timelines and prevent conflicts.';
      case PlayerRole.bioSmith:
        return 'Experts in biological systems who can enhance living organisms and heal environmental damage.';
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final gameProvider = Provider.of<GameProvider>(context);
    final user = authProvider.currentUser;
    
    return LoadingOverlay(
      isLoading: _isSaving,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Profile'),
          actions: [
            if (!_isEditing)
              IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () {
                  setState(() {
                    _isEditing = true;
                  });
                },
              )
            else
              IconButton(
                icon: const Icon(Icons.cancel),
                onPressed: () {
                  setState(() {
                    _isEditing = false;
                    // Reset controllers to original values
                    _usernameController.text = user?.username ?? '';
                    _emailController.text = user?.email ?? '';
                    
                    if (user?.preferredRole != null) {
                      try {
                        _selectedRole = PlayerRole.values.firstWhere(
                          (role) => role.name == user!.preferredRole,
                        );
                      } catch (_) {
                        _selectedRole = PlayerRole.technoMonk;
                      }
                    }
                  });
                },
              ),
          ],
        ),
        body: user == null
            ? const Center(child: Text('User not found'))
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Profile Header
                    Center(
                      child: Column(
                        children: [
                          // Avatar with Frame
                          Stack(
                            alignment: Alignment.center,
                            children: [
                              // Avatar Frame
                              SvgPicture.asset(
                                'assets/images/avatar-frame-${user.preferredRole.toLowerCase()}.svg',
                                width: 120,
                                height: 120,
                              ),
                              
                              // Avatar (or placeholder)
                              CircleAvatar(
                                radius: 40,
                                backgroundColor: Theme.of(context).colorScheme.primary,
                                child: Text(
                                  user.username.substring(0, 1).toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 30,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          
                          const SizedBox(height: 16),
                          
                          // Username
                          if (!_isEditing)
                            Text(
                              user.username,
                              style: Theme.of(context).textTheme.headlineMedium,
                            ),
                          
                          const SizedBox(height: 8),
                          
                          // Role
                          if (!_isEditing)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                user.preferredRole.split(RegExp('(?=[A-Z])')).join(' '),
                                style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    
                    // Edit Profile Form
                    if (_isEditing)
                      Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Edit Profile',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Username Field
                            CustomTextField(
                              controller: _usernameController,
                              labelText: 'Username',
                              hintText: 'Enter your username',
                              prefixIcon: Icons.person_outline,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter a username';
                                }
                                if (value.length < 3) {
                                  return 'Username must be at least 3 characters';
                                }
                                return null;
                              },
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Email Field (disabled)
                            CustomTextField(
                              controller: _emailController,
                              labelText: 'Email',
                              hintText: 'Enter your email',
                              prefixIcon: Icons.email_outlined,
                              keyboardType: TextInputType.emailAddress,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Please enter your email';
                                }
                                return null;
                              },
                              // Email cannot be changed
                              onChanged: null,
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Role Selection
                            Text(
                              'Choose Your Role',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Role Selection Cards
                            SizedBox(
                              height: 180,
                              child: ListView(
                                scrollDirection: Axis.horizontal,
                                children: PlayerRole.values.map((role) {
                                  final isSelected = role == _selectedRole;
                                  
                                  return GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _selectedRole = role;
                                      });
                                    },
                                    child: Container(
                                      width: 150,
                                      margin: const EdgeInsets.only(right: 16),
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? Theme.of(context).colorScheme.primary.withOpacity(0.2)
                                            : Theme.of(context).colorScheme.surface,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                          color: isSelected
                                              ? Theme.of(context).colorScheme.primary
                                              : Colors.transparent,
                                          width: 2,
                                        ),
                                      ),
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          SvgPicture.asset(
                                            AssetHelper.getRoleIconPath(role),
                                            width: 40,
                                            height: 40,
                                          ),
                                          const SizedBox(height: 8),
                                          Text(
                                            role.name.split(RegExp('(?=[A-Z])')).join(' '),
                                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                              color: isSelected
                                                  ? Theme.of(context).colorScheme.primary
                                                  : null,
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            _getRoleDescription(role),
                                            style: Theme.of(context).textTheme.bodySmall,
                                            textAlign: TextAlign.center,
                                            maxLines: 3,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Save Button
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: _saveProfile,
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                ),
                                child: const Text('SAVE CHANGES'),
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      // Profile Info
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Stats Section
                          Text(
                            'Stats',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          
                          const SizedBox(height: 16),
                          
                          // Stats Cards
                          Row(
                            children: [
                              // Karma
                              Expanded(
                                child: _buildStatCard(
                                  context,
                                  'Karma',
                                  user.karma.toString(),
                                  Icons.star,
                                  Colors.amber,
                                ),
                              ),
                              const SizedBox(width: 16),
                              // Games Played
                              Expanded(
                                child: _buildStatCard(
                                  context,
                                  'Games',
                                  user.gamesPlayed.toString(),
                                  Icons.games,
                                  Colors.blue,
                                ),
                              ),
                              const SizedBox(width: 16),
                              // Games Won
                              Expanded(
                                child: _buildStatCard(
                                  context,
                                  'Wins',
                                  user.gamesWon.toString(),
                                  Icons.emoji_events,
                                  Colors.green,
                                ),
                              ),
                            ],
                          ),
                          
                          const SizedBox(height: 32),
                          
                          // Account Info Section
                          Text(
                            'Account Info',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          
                          const SizedBox(height: 16),
                          
                          // Email
                          ListTile(
                            leading: const Icon(Icons.email),
                            title: const Text('Email'),
                            subtitle: Text(user.email),
                          ),
                          
                          // Created At
                          ListTile(
                            leading: const Icon(Icons.calendar_today),
                            title: const Text('Joined'),
                            subtitle: Text(user.createdAt.toString().substring(0, 10)),
                          ),
                          
                          // Last Login
                          ListTile(
                            leading: const Icon(Icons.access_time),
                            title: const Text('Last Login'),
                            subtitle: Text(user.lastLogin.toString().substring(0, 10)),
                          ),
                          
                          const SizedBox(height: 32),
                          
                          // Logout Button
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton(
                              onPressed: () async {
                                await authProvider.logout();
                                if (mounted) {
                                  Navigator.of(context).pushReplacementNamed('/login');
                                }
                              },
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 16),
                              ),
                              child: const Text('LOGOUT'),
                            ),
                          ),
                        ],
                      ),
                    
                    // Error Message
                    if (authProvider.errorMessage.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 16),
                        child: Text(
                          authProvider.errorMessage,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.error,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                  ],
                ),
              ),
      ),
    );
  }
  
  Widget _buildStatCard(BuildContext context, String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(
              icon,
              color: color,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
