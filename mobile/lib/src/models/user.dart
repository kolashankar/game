class User {
  final String id;
  final String username;
  final String email;
  final String preferredRole;
  final int karma;
  final int gamesPlayed;
  final int gamesWon;
  final String avatarUrl;
  final DateTime createdAt;
  final DateTime lastLogin;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.preferredRole,
    this.karma = 0,
    this.gamesPlayed = 0,
    this.gamesWon = 0,
    this.avatarUrl = '',
    required this.createdAt,
    required this.lastLogin,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      preferredRole: json['preferredRole'] ?? 'Techno Monk',
      karma: json['karma'] ?? 0,
      gamesPlayed: json['gamesPlayed'] ?? 0,
      gamesWon: json['gamesWon'] ?? 0,
      avatarUrl: json['avatarUrl'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      lastLogin: DateTime.parse(json['lastLogin']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'preferredRole': preferredRole,
      'karma': karma,
      'gamesPlayed': gamesPlayed,
      'gamesWon': gamesWon,
      'avatarUrl': avatarUrl,
      'createdAt': createdAt.toIso8601String(),
      'lastLogin': lastLogin.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? username,
    String? email,
    String? preferredRole,
    int? karma,
    int? gamesPlayed,
    int? gamesWon,
    String? avatarUrl,
    DateTime? createdAt,
    DateTime? lastLogin,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      preferredRole: preferredRole ?? this.preferredRole,
      karma: karma ?? this.karma,
      gamesPlayed: gamesPlayed ?? this.gamesPlayed,
      gamesWon: gamesWon ?? this.gamesWon,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
    );
  }
}
