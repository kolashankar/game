import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../models/player.dart';
import '../utils/asset_helper.dart';

class PlayerCard extends StatelessWidget {
  final Player player;
  final bool isCurrentPlayer;
  final bool isCurrentTurn;
  final bool isReady;
  final bool isGameInProgress;

  const PlayerCard({
    Key? key,
    required this.player,
    this.isCurrentPlayer = false,
    this.isCurrentTurn = false,
    this.isReady = false,
    this.isGameInProgress = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final roleColor = _getRoleColor(player.role);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: isCurrentTurn ? 4 : 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: isCurrentTurn
            ? BorderSide(color: Colors.green, width: 2)
            : BorderSide.none,
      ),
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
                      if (isCurrentTurn)
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
                      color: roleColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (!isGameInProgress)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        isReady ? 'Ready' : 'Not Ready',
                        style: TextStyle(
                          color: isReady ? Colors.green : Colors.orange,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            
            // Player Stats (only shown in game)
            if (isGameInProgress)
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
}
