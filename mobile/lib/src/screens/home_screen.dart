import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../config/routes.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../models/game.dart';
import '../widgets/loading_overlay.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _gameNameController = TextEditingController();
  final _gameCodeController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    // Load user's games when the screen is first loaded
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadUserGames();
    });
  }
  
  @override
  void dispose() {
    _gameNameController.dispose();
    _gameCodeController.dispose();
    super.dispose();
  }
  
  Future<void> _loadUserGames() async {
    final gameProvider = Provider.of<GameProvider>(context, listen: false);
    await gameProvider.loadUserGames();
  }
  
  void _showCreateGameDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create New Game'),
        content: TextField(
          controller: _gameNameController,
          decoration: const InputDecoration(
            labelText: 'Game Name',
            hintText: 'Enter a name for your game',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (_gameNameController.text.isNotEmpty) {
                Navigator.of(context).pop();
                
                final gameProvider = Provider.of<GameProvider>(context, listen: false);
                final success = await gameProvider.createGame(_gameNameController.text.trim());
                
                if (success && mounted) {
                  Navigator.of(context).pushNamed(Routes.gameDetails);
                }
                
                _gameNameController.clear();
              }
            },
            child: const Text('CREATE'),
          ),
        ],
      ),
    );
  }
  
  void _showJoinGameDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Join Game'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _gameCodeController,
              decoration: const InputDecoration(
                labelText: 'Game Code',
                hintText: 'Enter the game code',
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).pushNamed(Routes.gameScanner);
                  },
                  icon: const Icon(Icons.qr_code_scanner),
                  label: const Text('Scan QR'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.secondary,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (_gameCodeController.text.isNotEmpty) {
                Navigator.of(context).pop();
                
                // TODO: Implement joining a game with the code
                // For now, just navigate to the game scanner
                Navigator.of(context).pushNamed(Routes.gameScanner);
                
                _gameCodeController.clear();
              }
            },
            child: const Text('JOIN'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final gameProvider = Provider.of<GameProvider>(context);
    final user = authProvider.currentUser;
    final isLoadingGames = gameProvider.isLoadingGames;
    
    return LoadingOverlay(
      isLoading: isLoadingGames,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('ChronoCore Companion'),
          actions: [
            IconButton(
              icon: const Icon(Icons.person),
              onPressed: () {
                Navigator.of(context).pushNamed(Routes.profile);
              },
            ),
            IconButton(
              icon: const Icon(Icons.settings),
              onPressed: () {
                Navigator.of(context).pushNamed(Routes.settings);
              },
            ),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: _loadUserGames,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Welcome Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 30,
                              backgroundColor: Theme.of(context).colorScheme.primary,
                              child: Text(
                                user?.username.substring(0, 1).toUpperCase() ?? 'U',
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Welcome, ${user?.username ?? 'Architect'}',
                                    style: Theme.of(context).textTheme.headlineMedium,
                                  ),
                                  Text(
                                    'Role: ${user?.preferredRole ?? 'Unknown'}',
                                    style: Theme.of(context).textTheme.bodyMedium,
                                  ),
                                  Text(
                                    'Karma: ${user?.karma ?? 0}',
                                    style: Theme.of(context).textTheme.bodyMedium,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Game Actions
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _showCreateGameDialog,
                        icon: const Icon(Icons.add),
                        label: const Text('Create Game'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _showJoinGameDialog,
                        icon: const Icon(Icons.login),
                        label: const Text('Join Game'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          backgroundColor: Theme.of(context).colorScheme.secondary,
                        ),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 24),
                
                // Active Games Section
                Text(
                  'Your Active Games',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                
                const SizedBox(height: 16),
                
                // Game List
                if (gameProvider.userGames.isEmpty && !isLoadingGames)
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SvgPicture.asset(
                          'assets/images/game-board-bg.svg',
                          width: 150,
                          height: 150,
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No active games',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Create a new game or join an existing one',
                          style: Theme.of(context).textTheme.bodyMedium,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: gameProvider.userGames.length,
                    itemBuilder: (context, index) {
                      final game = gameProvider.userGames[index];
                      return _buildGameCard(context, game);
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  Widget _buildGameCard(BuildContext context, Game game) {
    final statusColor = game.status == GameStatus.inProgress
        ? Colors.green
        : game.status == GameStatus.waiting
            ? Colors.orange
            : Colors.blue;
    
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          final gameProvider = Provider.of<GameProvider>(context, listen: false);
          gameProvider.loadGame(game.id);
          Navigator.of(context).pushNamed(Routes.gameDetails);
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      game.name,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      game.status.name.toUpperCase(),
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Created: ${game.createdAt.toString().substring(0, 16)}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 4),
              Text(
                'Players: ${game.players.length}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.person, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    'Host: ${game.hostId}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.code, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    'Game Code: ${game.gameCode}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
