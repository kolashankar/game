import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../utils/asset_helper.dart';

import '../config/routes.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../models/game.dart';
import '../models/player.dart';
import '../models/realm.dart';
import '../models/timeline.dart';
import '../widgets/loading_overlay.dart';

class GameBoardScreen extends StatefulWidget {
  const GameBoardScreen({Key? key}) : super(key: key);

  @override
  State<GameBoardScreen> createState() => _GameBoardScreenState();
}

class _GameBoardScreenState extends State<GameBoardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    
    // Load game data when screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshGameData();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _refreshGameData() async {
    final gameProvider = Provider.of<GameProvider>(context, listen: false);
    
    setState(() {
      _isLoading = true;
    });
    
    await gameProvider.refreshCurrentGame();
    
    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final gameProvider = Provider.of<GameProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context);
    final game = gameProvider.currentGame;
    final user = authProvider.currentUser;
    
    if (game == null || user == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Game Board'),
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
    
    return LoadingOverlay(
      isLoading: _isLoading,
      child: Scaffold(
        appBar: AppBar(
          title: Text(game.name),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _refreshGameData,
            ),
            IconButton(
              icon: const Icon(Icons.info_outline),
              onPressed: () {
                Navigator.of(context).pushNamed(Routes.gameDetails);
              },
            ),
          ],
          bottom: TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: 'BOARD'),
              Tab(text: 'TIMELINE'),
              Tab(text: 'PLAYERS'),
            ],
          ),
        ),
        body: TabBarView(
          controller: _tabController,
          children: [
            // Board Tab
            _buildBoardTab(context, game, currentPlayer),
            
            // Timeline Tab
            _buildTimelineTab(context, game),
            
            // Players Tab
            _buildPlayersTab(context, game, user.id),
          ],
        ),
        floatingActionButton: currentPlayer.isCurrentTurn
            ? FloatingActionButton.extended(
                onPressed: () async {
                  setState(() {
                    _isLoading = true;
                  });
                  
                  await gameProvider.endTurn();
                  
                  setState(() {
                    _isLoading = false;
                  });
                },
                icon: const Icon(Icons.skip_next),
                label: const Text('END TURN'),
                backgroundColor: Colors.orange,
              )
            : null,
      ),
    );
  }
  
  Widget _buildBoardTab(BuildContext context, Game game, Player currentPlayer) {
    final realms = game.realms;
    
    return RefreshIndicator(
      onRefresh: _refreshGameData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Game Status
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Current Turn: ${game.currentTurnPlayer?.username ?? 'Loading...'}${game.currentTurnPlayer?.userId == currentPlayer.userId ? ' (You)' : ''}',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Turn: ${game.currentTurn} / ${game.maxTurns}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: game.currentTurn / game.maxTurns,
                      backgroundColor: Colors.grey[300],
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Player Resources
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your Resources',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildResourceItem(
                          context,
                          'Tech',
                          currentPlayer.techResources,
                          'assets/icons/tech-icon.svg',
                          Colors.blue,
                        ),
                        _buildResourceItem(
                          context,
                          'Nature',
                          currentPlayer.natureResources,
                          'assets/icons/nature-icon.svg',
                          Colors.green,
                        ),
                        _buildResourceItem(
                          context,
                          'Urban',
                          currentPlayer.urbanResources,
                          'assets/icons/urban-icon.svg',
                          Colors.orange,
                        ),
                        _buildResourceItem(
                          context,
                          'Void',
                          currentPlayer.voidResources,
                          'assets/icons/void-icon.svg',
                          Colors.purple,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber),
                        const SizedBox(width: 8),
                        Text(
                          'Karma: ${currentPlayer.karma}',
                          style: Theme.of(context).textTheme.titleSmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Realms Section
            Text(
              'Realms',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            
            const SizedBox(height: 16),
            
            // Realms Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 0.8,
              ),
              itemCount: realms.length,
              itemBuilder: (context, index) {
                final realm = realms[index];
                return _buildRealmCard(context, realm, currentPlayer);
              },
            ),
            
            const SizedBox(height: 24),
            
            // Active Quests Section
            Text(
              'Your Active Quests',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            
            const SizedBox(height: 16),
            
            // Quests List
            if (currentPlayer.activeQuests.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('No active quests'),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: currentPlayer.activeQuests.length,
                itemBuilder: (context, index) {
                  final quest = currentPlayer.activeQuests[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: ListTile(
                      title: Text(quest.title),
                      subtitle: Text(quest.description),
                      trailing: const Icon(Icons.arrow_forward_ios),
                      onTap: () {
                        // TODO: Navigate to quest details
                      },
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildTimelineTab(BuildContext context, Game game) {
    final timeline = game.timeline;
    
    return timeline == null
        ? const Center(child: Text('Timeline not available'))
        : SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Timeline Status',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.timeline, size: 16),
                            const SizedBox(width: 8),
                            Text(
                              'Stability: ${timeline.stability}%',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        LinearProgressIndicator(
                          value: timeline.stability / 100,
                          backgroundColor: Colors.grey[300],
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _getStabilityColor(timeline.stability),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // Timeline Nodes
                Text(
                  'Timeline Nodes',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                
                const SizedBox(height: 16),
                
                // Timeline Visualization
                SizedBox(
                  height: 500,
                  child: Stack(
                    children: [
                      // Central Timeline Line
                      Positioned(
                        left: MediaQuery.of(context).size.width / 2 - 2,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        child: Container(
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                        ),
                      ),
                      
                      // Timeline Nodes
                      ...timeline.nodes.asMap().entries.map((entry) {
                        final index = entry.key;
                        final node = entry.value;
                        final isEven = index % 2 == 0;
                        
                        return Positioned(
                          left: isEven ? 0 : null,
                          right: isEven ? null : 0,
                          top: 50.0 + index * 120,
                          width: MediaQuery.of(context).size.width / 2 - 32,
                          child: _buildTimelineNode(
                            context,
                            node,
                            isEven,
                            index == timeline.nodes.length - 1,
                          ),
                        );
                      }).toList(),
                    ],
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // View in AR Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pushNamed(
                        Routes.arView,
                        arguments: {
                          'isTimeline': true,
                        },
                      );
                    },
                    icon: const Icon(Icons.view_in_ar),
                    label: const Text('VIEW TIMELINE IN AR'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ],
            ),
          );
  }
  
  Widget _buildPlayersTab(BuildContext context, Game game, String currentUserId) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: game.players.length,
      itemBuilder: (context, index) {
        final player = game.players[index];
        final isCurrentPlayer = player.userId == currentUserId;
        
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    // Player Avatar with Role Icon
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        // Role Background
                        Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: _getRoleColor(player.role).withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                        ),
                        
                        // Role Icon
                        SvgPicture.asset(
                          AssetHelper.getRoleIconPath(player.role),
                          width: 36,
                          height: 36,
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
                                    'CURRENT TURN',
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
                              color: _getRoleColor(player.role),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                
                // Player Stats
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildPlayerStat(context, 'Karma', player.karma.toString(), Icons.star, Colors.amber),
                    _buildPlayerStat(
                      context,
                      'Tech',
                      player.techResources.toString(),
                      Icons.memory,
                      Colors.blue,
                    ),
                    _buildPlayerStat(
                      context,
                      'Nature',
                      player.natureResources.toString(),
                      Icons.eco,
                      Colors.green,
                    ),
                    _buildPlayerStat(
                      context,
                      'Urban',
                      player.urbanResources.toString(),
                      Icons.location_city,
                      Colors.orange,
                    ),
                    _buildPlayerStat(
                      context,
                      'Void',
                      player.voidResources.toString(),
                      Icons.blur_circular,
                      Colors.purple,
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                
                // Player Position
                if (player.position.isNotEmpty)
                  Row(
                    children: [
                      const Icon(Icons.place, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Position: ${player.position}',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
  
  Widget _buildResourceItem(BuildContext context, String name, int count, String iconPath, Color color) {
    return Column(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: SvgPicture.asset(
              iconPath,
              width: 30,
              height: 30,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          count.toString(),
          style: Theme.of(context).textTheme.titleMedium,
        ),
        Text(
          name,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
  
  Widget _buildRealmCard(BuildContext context, Realm realm, Player currentPlayer) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).pushNamed(
          Routes.arView,
          arguments: {
            'isTimeline': false,
            'realmId': realm.id,
          },
        );
      },
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            // Realm Background Image
            Positioned.fill(
              child: Image.asset(
                'assets/images/realm-${realm.type.toLowerCase()}.jpg',
                fit: BoxFit.cover,
              ),
            ),
            
            // Gradient Overlay
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.7),
                    ],
                  ),
                ),
              ),
            ),
            
            // Realm Info
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    realm.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    realm.type.name,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.view_in_ar,
                        color: Colors.white,
                        size: 16,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'View in AR',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            // Stability Indicator
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStabilityColor(realm.stability).withOpacity(0.8),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${realm.stability}%',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildTimelineNode(BuildContext context, TimelineNode node, bool isLeft, bool isLast) {
    return Row(
      mainAxisAlignment: isLeft ? MainAxisAlignment.end : MainAxisAlignment.start,
      children: [
        if (!isLeft) const SizedBox(width: 16),
        
        // Node Content
        Expanded(
          child: Card(
            color: _getNodeStatusColor(node.status).withOpacity(0.1),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
              side: BorderSide(
                color: _getNodeStatusColor(node.status),
                width: 2,
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    node.title,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: _getNodeStatusColor(node.status),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    node.description,
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Year: ${node.year}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: _getNodeStatusColor(node.status).withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          node.status.toUpperCase(),
                          style: TextStyle(
                            color: _getNodeStatusColor(node.status),
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
        
        // Node Connector
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: _getNodeStatusColor(node.status),
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.white,
              width: 2,
            ),
          ),
        ),
        
        if (isLeft) const SizedBox(width: 16),
      ],
    );
  }
  
  Widget _buildPlayerStat(BuildContext context, String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleSmall,
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
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
  
  Color _getStabilityColor(int stability) {
    if (stability >= 75) {
      return Colors.green;
    } else if (stability >= 50) {
      return Colors.orange;
    } else if (stability >= 25) {
      return Colors.deepOrange;
    } else {
      return Colors.red;
    }
  }
  
  Color _getNodeStatusColor(TimelineNodeStatus status) {
    switch (status) {
      case TimelineNodeStatus.active:
        return Colors.green;
      case TimelineNodeStatus.completed:
        return Colors.blue;
      case TimelineNodeStatus.locked:
        return Colors.grey;
      case TimelineNodeStatus.hidden:
        return Colors.black;
      case TimelineNodeStatus.inactive:
      default:
        return Colors.orange;
    }
  }
}
