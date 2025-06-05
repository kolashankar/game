import 'package:chronocore_companion/src/models/player.dart';
import 'package:chronocore_companion/src/models/timeline.dart';
import 'package:chronocore_companion/src/models/realm.dart';
import 'package:chronocore_companion/src/models/quest.dart';

enum GameStatus {
  waiting,
  inProgress,
  completed,
  cancelled
}

extension GameStatusExtension on GameStatus {
  String get name {
    switch (this) {
      case GameStatus.waiting:
        return 'waiting';
      case GameStatus.inProgress:
        return 'in_progress';
      case GameStatus.completed:
        return 'completed';
      case GameStatus.cancelled:
        return 'cancelled';
    }
  }
  
  static GameStatus fromString(String status) {
    switch (status.toLowerCase()) {
      case 'waiting':
        return GameStatus.waiting;
      case 'in_progress':
        return GameStatus.inProgress;
      case 'completed':
        return GameStatus.completed;
      case 'cancelled':
        return GameStatus.cancelled;
      default:
        return GameStatus.waiting;
    }
  }
}

class Game {
  final String id;
  final String name;
  final String gameCode;
  final String hostId;
  final String hostName;
  final List<Player> players;
  final GameStatus status;
  final int currentTurn;
  final int maxTurns;
  final Player? currentTurnPlayer;
  final Timeline? timeline;
  final List<Realm> realms;
  final List<Quest> quests;
  final DateTime createdAt;
  final DateTime updatedAt;

  Game({
    required this.id,
    required this.name,
    required this.gameCode,
    required this.hostId,
    required this.hostName,
    required this.players,
    required this.status,
    required this.currentTurn,
    this.maxTurns = 20,
    this.currentTurnPlayer,
    this.timeline,
    required this.realms,
    this.quests = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory Game.fromJson(Map<String, dynamic> json) {
    // Find current turn player
    Player? currentTurnPlayer;
    if (json['players'] != null) {
      final players = (json['players'] as List)
          .map((player) => Player.fromJson(player))
          .toList();
      try {
        currentTurnPlayer = players.firstWhere(
          (player) => player.isCurrentTurn,
        );
      } catch (e) {
        currentTurnPlayer = players.isNotEmpty ? players.first : null;
      }
    }
    
    return Game(
      id: json['id'],
      name: json['name'],
      gameCode: json['gameCode'],
      hostId: json['hostId'],
      hostName: json['hostName'] ?? 'Unknown Host',
      players: json['players'] != null
          ? (json['players'] as List)
              .map((player) => Player.fromJson(player))
              .toList()
          : [],
      status: json['status'] != null
          ? GameStatusExtension.fromString(json['status'])
          : GameStatus.waiting,
      currentTurn: json['currentTurn'] ?? 1,
      maxTurns: json['maxTurns'] ?? 20,
      currentTurnPlayer: currentTurnPlayer,
      timeline: json['timeline'] != null
          ? Timeline.fromJson(json['timeline'])
          : null,
      realms: json['realms'] != null
          ? (json['realms'] as List)
              .map((realm) => Realm.fromJson(realm))
              .toList()
          : [],
      quests: json['quests'] != null
          ? (json['quests'] as List)
              .map((quest) => Quest.fromJson(quest))
              .toList()
          : [],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'gameCode': gameCode,
      'hostId': hostId,
      'hostName': hostName,
      'players': players.map((player) => player.toJson()).toList(),
      'status': status.name,
      'currentTurn': currentTurn,
      'maxTurns': maxTurns,
      'timeline': timeline?.toJson(),
      'realms': realms.map((realm) => realm.toJson()).toList(),
      'quests': quests.map((quest) => quest.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Game copyWith({
    String? id,
    String? name,
    String? gameCode,
    String? hostId,
    String? hostName,
    List<Player>? players,
    GameStatus? status,
    int? currentTurn,
    int? maxTurns,
    Player? currentTurnPlayer,
    Timeline? timeline,
    List<Realm>? realms,
    List<Quest>? quests,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Game(
      id: id ?? this.id,
      name: name ?? this.name,
      gameCode: gameCode ?? this.gameCode,
      hostId: hostId ?? this.hostId,
      hostName: hostName ?? this.hostName,
      players: players ?? this.players,
      status: status ?? this.status,
      currentTurn: currentTurn ?? this.currentTurn,
      maxTurns: maxTurns ?? this.maxTurns,
      currentTurnPlayer: currentTurnPlayer ?? this.currentTurnPlayer,
      timeline: timeline ?? this.timeline,
      realms: realms ?? this.realms,
      quests: quests ?? this.quests,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
