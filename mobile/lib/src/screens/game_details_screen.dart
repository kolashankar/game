import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../utils/asset_helper.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../config/routes.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../models/game.dart';
import '../models/player.dart';
import '../widgets/loading_overlay.dart';

class GameDetailsScreen extends StatefulWidget {
  const GameDetailsScreen({Key? key}) : super(key: key);

  @override
  State<GameDetailsScreen> createState() => _GameDetailsScreenState();
}

class _GameDetailsScreenState extends State<GameDetailsScreen> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final gameProvider = Provider.of<GameProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final game = gameProvider.currentGame;
    final user = authProvider.currentUser;
    
    if (game == null || user == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Game Details'),
        ),
        body: const Center(
          child: Text('Game not found'),
        ),
      );
    }
    
    // Find current player in the game
    final currentPlayer = game.players.firstWhere(
      (player) => player.userId == user.id,
      orElse: () => Player(
        id: '',
        userId: user.id,
        username: user.username,
        role: PlayerRole.technoMonk,
        position: '',
      ),
    );
    
    // Check if user is the host
    final isHost = game.hostId == user.id;
    
    // Check if all players are ready
    final allPlayersReady = game.players.every((player) => player.isReady);
    
    return LoadingOverlay(
      isLoading: _isLoading,
      child: Scaffold(
        appBar: AppBar(
          title: Text(game.name),
          actions: [
            IconButton(
              icon: const Icon(Icons.qr_code),
              onPressed: () {
                _showQRCodeDialog(context, game.gameCode);
              },
            ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Game Status Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Game Status',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          _buildStatusBadge(context, game.status),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          const Icon(Icons.person, size: 16),
                          const SizedBox(width: 8),
                          Text(
                            'Host: ${game.hostId == user.id ? 'You' : game.players.firstWhere((p) => p.userId == game.hostId, orElse: () => Player(id: '', userId: '', username: 'Unknown', role: PlayerRole.technoMonk, position: '')).username}',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.group, size: 16),
                          const SizedBox(width: 8),
                          Text(
                            'Players: ${game.players.length}',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.code, size: 16),
                          const SizedBox(width: 8),
                          Text(
                            'Game Code: ${game.gameCode}',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                          const Spacer(),
                          IconButton(
                            icon: const Icon(Icons.copy, size: 16),
                            onPressed: () {
                              // Copy game code to clipboard
                              // TODO: Implement clipboard functionality
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Game code copied to clipboard')),
                              );
                            },
                          ),
                        ],
                      ),
                      if (game.status == GameStatus.waiting)
                        Padding(
                          padding: const EdgeInsets.only(top: 16),
                          child: Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () async {
                                    setState(() {
                                      _isLoading = true;
                                    });
                                    
                                    await gameProvider.setPlayerReady(!currentPlayer.isReady);
                                    
                                    setState(() {
                                      _isLoading = false;
                                    });
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: currentPlayer.isReady
                                        ? Colors.orange
                                        : Theme.of(context).colorScheme.primary,
                                  ),
                                  child: Text(currentPlayer.isReady ? 'NOT READY' : 'READY'),
                                ),
                              ),
                              if (isHost)
                                Padding(
                                  padding: const EdgeInsets.only(left: 16),
                                  child: ElevatedButton(
                                    onPressed: allPlayersReady
                                        ? () async {
                                            setState(() {
                                              _isLoading = true;
                                            });
                                            
                                            final success = await gameProvider.startGame();
                                            
                                            setState(() {
                                              _isLoading = false;
                                            });
                                            
                                            if (success && mounted) {
                                              // Navigate to game board
                                              // TODO: Implement game board navigation
                                            }
                                          }
                                        : null,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Theme.of(context).colorScheme.secondary,
                                    ),
                                    child: const Text('START GAME'),
                                  ),
                                ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Players Section
              Text(
                'Players',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              
              const SizedBox(height: 16),
              
              // Player List
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: game.players.length,
                itemBuilder: (context, index) {
                  final player = game.players[index];
                  return _buildPlayerCard(context, player, player.userId == user.id, game.status);
                },
              ),
              
              const SizedBox(height: 24),
              
              // Game Actions
              if (game.status == GameStatus.inProgress)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Game Actions',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    
                    const SizedBox(height: 16),
                    
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.of(context).pushNamed(
                                Routes.arView,
                                arguments: {
                                  'isTimeline': true,
                                },
                              );
                            },
                            icon: const Icon(Icons.timeline),
                            label: const Text('View Timeline'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              // TODO: Implement view quests
                            },
                            icon: const Icon(Icons.assignment),
                            label: const Text('View Quests'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              backgroundColor: Theme.of(context).colorScheme.secondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: currentPlayer.isCurrentTurn
                            ? () async {
                                setState(() {
                                  _isLoading = true;
                                });
                                
                                await gameProvider.endTurn();
                                
                                setState(() {
                                  _isLoading = false;
                                });
                              }
                            : null,
                        icon: const Icon(Icons.skip_next),
                        label: const Text('End Turn'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          backgroundColor: Colors.orange,
                        ),
                      ),
                    ),
                  ],
                ),
              
              const SizedBox(height: 24),
              
              // Leave Game Button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () async {
                    final confirmed = await showDialog<bool>(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Leave Game'),
                        content: const Text('Are you sure you want to leave this game?'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(false),
                            child: const Text('CANCEL'),
                          ),
                          ElevatedButton(
                            onPressed: () => Navigator.of(context).pop(true),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Theme.of(context).colorScheme.error,
                            ),
                            child: const Text('LEAVE'),
                          ),
                        ],
                      ),
                    ) ?? false;
                    
                    if (confirmed) {
                      setState(() {
                        _isLoading = true;
                      });
                      
                      final success = await gameProvider.leaveGame();
                      
                      setState(() {
                        _isLoading = false;
                      });
                      
                      if (success && mounted) {
                        Navigator.of(context).pop();
                      }
                    }
                  },
                  icon: const Icon(Icons.exit_to_app),
                  label: const Text('LEAVE GAME'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    foregroundColor: Theme.of(context).colorScheme.error,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildStatusBadge(BuildContext context, GameStatus status) {
    final statusColor = status == GameStatus.inProgress
        ? Colors.green
        : status == GameStatus.waiting
            ? Colors.orange
            : Colors.blue;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        status.name.toUpperCase(),
        style: TextStyle(
          color: statusColor,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
  
  Widget _buildPlayerCard(BuildContext context, Player player, bool isCurrentPlayer, GameStatus gameStatus) {
    final roleColor = _getRoleColor(player.role);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Player Avatar with Role Icon
            Stack(
              alignment: Alignment.center,
              children: [
                // Role Background
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: roleColor.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                ),
                
                // Role Icon
                SvgPicture.asset(
                  AssetHelper.getRoleIconPath(player.role),
                  width: 30,
                  height: 30,
                ),
              ],
            ),
            
            const SizedBox(width: 16),
            
            // Player Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        '${player.username}${isCurrentPlayer ? ' (You)' : ''}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      if (player.isCurrentTurn)
                        Container(
                          margin: const EdgeInsets.only(left: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'TURN',
                            style: TextStyle(
                              color: Colors.green,
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    player.role.name.split(RegExp('(?=[A-Z])')).join(' '),
                    style: TextStyle(
                      color: roleColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (gameStatus == GameStatus.waiting)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        player.isReady ? 'Ready' : 'Not Ready',
                        style: TextStyle(
                          color: player.isReady ? Colors.green : Colors.orange,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            
            // Player Stats (only shown in game)
            if (gameStatus == GameStatus.inProgress)
              Row(
                children: [
                  // Karma
                  Column(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 16),
                      const SizedBox(height: 4),
                      Text(
                        player.karma.toString(),
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  // Resources
                  Column(
                    children: [
                      const Icon(Icons.inventory_2, color: Colors.blue, size: 16),
                      const SizedBox(height: 4),
                      Text(
                        (player.techResources + player.natureResources + player.urbanResources + player.voidResources).toString(),
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
  
  Color _getRoleColor(PlayerRole role) {
    switch (role) {
      case PlayerRole.technoMonk:
        return Colors.blue;
      case PlayerRole.shadowBroker:
        return Colors.grey;
      case PlayerRole.chronoDiplomat:
        return Colors.pink;
      case PlayerRole.bioSmith:
        return Colors.green;
    }
  }
  
  void _showQRCodeDialog(BuildContext context, String gameCode) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Game QR Code'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Scan this code to join the game:'),
            const SizedBox(height: 16),
            QrImageView(
              data: 'chronocore://game/$gameCode',
              version: QrVersions.auto,
              size: 200,
              backgroundColor: Colors.white,
            ),
            const SizedBox(height: 16),
            Text(
              'Game Code: $gameCode',
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('CLOSE'),
          ),
        ],
      ),
    );
  }
}
