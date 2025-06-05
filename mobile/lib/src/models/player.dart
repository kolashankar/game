import 'quest.dart';

enum PlayerRole {
  technoMonk,
  shadowBroker,
  chronoDiplomat,
  bioSmith
}

class Player {
  final String id;
  final String userId;
  final String username;
  final PlayerRole role;
  final String position;
  final int karma;
  final int techResources;
  final int natureResources;
  final int urbanResources;
  final int voidResources;
  final bool isReady;
  final bool isCurrentTurn;
  final List<Quest> activeQuests;
  final int gamesPlayed;
  final int gamesWon;
  final String email;
  final DateTime createdAt;
  final DateTime lastLogin;
  final String preferredRole;
  final List<String> completedQuestIds;

  Player({
    required this.id,
    required this.userId,
    required this.username,
    required this.role,
    required this.position,
    this.karma = 0,
    this.techResources = 0,
    this.natureResources = 0,
    this.urbanResources = 0,
    this.voidResources = 0,
    this.isReady = false,
    this.isCurrentTurn = false,
    this.activeQuests = const [],
    this.gamesPlayed = 0,
    this.gamesWon = 0,
    this.email = '',
    DateTime? createdAt,
    DateTime? lastLogin,
    this.preferredRole = '',
    this.completedQuestIds = const [],
  }) : 
    this.createdAt = createdAt ?? DateTime.now(),
    this.lastLogin = lastLogin ?? DateTime.now();

  factory Player.fromJson(Map<String, dynamic> json) {
    return Player(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      username: json['username'] ?? 'Unknown',
      role: json['role'] != null 
          ? PlayerRole.values.firstWhere(
              (role) => role.name == json['role'],
              orElse: () => PlayerRole.technoMonk)
          : PlayerRole.technoMonk,
      position: json['position'] ?? '',
      karma: json['karma'] ?? 0,
      techResources: json['techResources'] ?? 0,
      natureResources: json['natureResources'] ?? 0,
      urbanResources: json['urbanResources'] ?? 0,
      voidResources: json['voidResources'] ?? 0,
      isReady: json['isReady'] ?? false,
      isCurrentTurn: json['isCurrentTurn'] ?? false,
      activeQuests: json['activeQuests'] != null
          ? (json['activeQuests'] as List)
              .map((quest) => Quest.fromJson(quest))
              .toList()
          : [],
      gamesPlayed: json['gamesPlayed'] ?? 0,
      gamesWon: json['gamesWon'] ?? 0,
      email: json['email'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
      lastLogin: json['lastLogin'] != null
          ? DateTime.parse(json['lastLogin'])
          : null,
      preferredRole: json['preferredRole'] ?? '',
      completedQuestIds: json['completedQuestIds'] != null 
          ? List<String>.from(json['completedQuestIds']) 
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'username': username,
      'role': role.name,
      'position': position,
      'karma': karma,
      'techResources': techResources,
      'natureResources': natureResources,
      'urbanResources': urbanResources,
      'voidResources': voidResources,
      'isReady': isReady,
      'isCurrentTurn': isCurrentTurn,
      'activeQuests': activeQuests.map((quest) => quest.toJson()).toList(),
      'gamesPlayed': gamesPlayed,
      'gamesWon': gamesWon,
      'email': email,
      'createdAt': createdAt.toIso8601String(),
      'lastLogin': lastLogin.toIso8601String(),
      'preferredRole': preferredRole,
      'completedQuestIds': completedQuestIds,
    };
  }

  Player copyWith({
    String? id,
    String? userId,
    String? username,
    PlayerRole? role,
    String? position,
    int? karma,
    int? techResources,
    int? natureResources,
    int? urbanResources,
    int? voidResources,
    bool? isReady,
    bool? isCurrentTurn,
    List<Quest>? activeQuests,
    int? gamesPlayed,
    int? gamesWon,
    String? email,
    DateTime? createdAt,
    DateTime? lastLogin,
    String? preferredRole,
    List<String>? completedQuestIds,
  }) {
    return Player(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      username: username ?? this.username,
      role: role ?? this.role,
      position: position ?? this.position,
      karma: karma ?? this.karma,
      techResources: techResources ?? this.techResources,
      natureResources: natureResources ?? this.natureResources,
      urbanResources: urbanResources ?? this.urbanResources,
      voidResources: voidResources ?? this.voidResources,
      isReady: isReady ?? this.isReady,
      isCurrentTurn: isCurrentTurn ?? this.isCurrentTurn,
      activeQuests: activeQuests ?? this.activeQuests,
      gamesPlayed: gamesPlayed ?? this.gamesPlayed,
      gamesWon: gamesWon ?? this.gamesWon,
      email: email ?? this.email,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
      preferredRole: preferredRole ?? this.preferredRole,
      completedQuestIds: completedQuestIds ?? this.completedQuestIds,
    );
  }
}
