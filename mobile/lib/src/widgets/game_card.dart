import 'package:flutter/material.dart';
import '../models/game.dart';

class GameCard extends StatelessWidget {
  final Game game;
  final VoidCallback onTap;
  final bool isDetailed;

  const GameCard({
    Key? key,
    required this.game,
    required this.onTap,
    this.isDetailed = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: LinearGradient(
              colors: _getGameStatusColors(game.status),
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        game.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    _buildStatusBadge(game.status),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.people, size: 16, color: Colors.white70),
                    const SizedBox(width: 4),
                    Text(
                      '${game.players.length} players',
                      style: const TextStyle(color: Colors.white70),
                    ),
                  ],
                ),
                if (isDetailed)
                  Column(
                    children: [
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.person, size: 16, color: Colors.white70),
                          const SizedBox(width: 4),
                          Text(
                            'Host: ${game.hostName}',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.code, size: 16, color: Colors.white70),
                          const SizedBox(width: 4),
                          Text(
                            'Code: ${game.gameCode}',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(GameStatus status) {
    Color badgeColor;
    String statusText;

    switch (status) {
      case GameStatus.waiting:
        badgeColor = Colors.amber;
        statusText = 'Waiting';
        break;
      case GameStatus.inProgress:
        badgeColor = Colors.green;
        statusText = 'In Progress';
        break;
      case GameStatus.completed:
        badgeColor = Colors.blue;
        statusText = 'Completed';
        break;
      case GameStatus.cancelled:
        badgeColor = Colors.grey;
        statusText = 'Cancelled';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: badgeColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        statusText,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  List<Color> _getGameStatusColors(GameStatus status) {
    switch (status) {
      case GameStatus.waiting:
        return [
          const Color(0xFF6A1B9A),
          const Color(0xFF4A148C),
        ];
      case GameStatus.inProgress:
        return [
          const Color(0xFF1565C0),
          const Color(0xFF0D47A1),
        ];
      case GameStatus.completed:
        return [
          const Color(0xFF2E7D32),
          const Color(0xFF1B5E20),
        ];
      case GameStatus.cancelled:
        return [
          Colors.grey.shade700,
          Colors.grey.shade900,
        ];
    }
  }
}
