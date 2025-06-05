enum QuestDifficulty {
  easy,
  medium,
  hard,
  epic
}

enum QuestType {
  tech,
  nature,
  urban,
  voidType,
  mixed
}

enum QuestStatus {
  pending,
  active,
  completed,
  failed,
  expired
}

extension QuestStatusExtension on QuestStatus {
  String get name {
    switch (this) {
      case QuestStatus.pending:
        return 'pending';
      case QuestStatus.active:
        return 'active';
      case QuestStatus.completed:
        return 'completed';
      case QuestStatus.failed:
        return 'failed';
      case QuestStatus.expired:
        return 'expired';
    }
  }
  
  // Use toDisplayString instead of toString to avoid conflict with Object.toString
  String toDisplayString() {
    return name;
  }
  
  static QuestStatus fromString(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return QuestStatus.pending;
      case 'active':
        return QuestStatus.active;
      case 'completed':
        return QuestStatus.completed;
      case 'failed':
        return QuestStatus.failed;
      case 'expired':
        return QuestStatus.expired;
      default:
        return QuestStatus.pending;
    }
  }
}

extension QuestTypeExtension on QuestType {
  String get name {
    switch (this) {
      case QuestType.tech:
        return 'tech';
      case QuestType.nature:
        return 'nature';
      case QuestType.urban:
        return 'urban';
      case QuestType.voidType:
        return 'void';
      case QuestType.mixed:
        return 'mixed';
    }
  }
  
  String toLowerCase() {
    return name.toLowerCase();
  }
}

class QuestOutcome {
  final String title;
  final String description;
  final Map<String, dynamic> effects;
  
  QuestOutcome({
    required this.title,
    required this.description,
    required this.effects,
  });
  
  factory QuestOutcome.fromJson(Map<String, dynamic> json) {
    return QuestOutcome(
      title: json['title'] ?? 'Unknown Outcome',
      description: json['description'] ?? '',
      effects: json['effects'] ?? {},
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'effects': effects,
    };
  }
  
  bool get isNotEmpty => title.isNotEmpty || description.isNotEmpty || effects.isNotEmpty;
  
  @override
  String toString() {
    return description;
  }
}

class QuestDecision {
  final String id;
  final String title;
  final String description;
  final int techImpact;
  final int natureImpact;
  final int urbanImpact;
  final int voidImpact;
  final int karmaImpact;
  final Map<String, dynamic> effects;

  QuestDecision({
    required this.id,
    required this.title,
    required this.description,
    this.techImpact = 0,
    this.natureImpact = 0,
    this.urbanImpact = 0,
    this.voidImpact = 0,
    this.karmaImpact = 0,
    required this.effects,
  });

  factory QuestDecision.fromJson(Map<String, dynamic> json) {
    return QuestDecision(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Decision',
      description: json['description'] ?? '',
      techImpact: json['techImpact'] ?? 0,
      natureImpact: json['natureImpact'] ?? 0,
      urbanImpact: json['urbanImpact'] ?? 0,
      voidImpact: json['voidImpact'] ?? 0,
      karmaImpact: json['karmaImpact'] ?? 0,
      effects: json['effects'] ?? {},
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'techImpact': techImpact,
      'natureImpact': natureImpact,
      'urbanImpact': urbanImpact,
      'voidImpact': voidImpact,
      'karmaImpact': karmaImpact,
      'effects': effects,
    };
  }
  
  // Helper method to determine if this decision has a positive impact
  bool get hasPositiveImpact => karmaImpact > 0 || techImpact > 0 || natureImpact > 0 || urbanImpact > 0 || voidImpact > 0;
  
  // Helper method to determine if this decision has a negative impact
  bool get hasNegativeImpact => karmaImpact < 0 || techImpact < 0 || natureImpact < 0 || urbanImpact < 0 || voidImpact < 0;
}

class Quest {
  final String id;
  final String title;
  final String description;
  final String storyText;
  final QuestDifficulty difficulty;
  final QuestType type;
  final String realmId;
  final String timelineNodeId;
  final List<QuestDecision> decisions;
  final Map<String, int> resourceRequirements;
  final Map<String, dynamic> metadata;
  final String imageUrl;
  final bool isActive;
  final bool isCompleted;
  final String? completedByPlayerId;
  final String? selectedDecisionId;
  final QuestStatus status;
  final DateTime? turnDue;
  final QuestOutcome? outcome;
  final QuestDecision? selectedDecision;
  final QuestOutcome? failureOutcome;

  Quest({
    required this.id,
    required this.title,
    required this.description,
    required this.storyText,
    required this.difficulty,
    required this.type,
    required this.realmId,
    required this.timelineNodeId,
    required this.decisions,
    required this.resourceRequirements,
    this.metadata = const {},
    required this.imageUrl,
    this.isActive = true,
    this.isCompleted = false,
    this.completedByPlayerId,
    this.selectedDecisionId,
    this.status = QuestStatus.pending,
    this.turnDue,
    this.outcome,
    this.selectedDecision,
    this.failureOutcome,
  });

  factory Quest.fromJson(Map<String, dynamic> json) {
    // Find selected decision if it exists
    QuestDecision? selectedDecision;
    final String? selectedId = json['selectedDecisionId'];
    if (selectedId != null && json['decisions'] != null) {
      final decisions = (json['decisions'] as List);
      final matchingDecisions = decisions.where(
        (d) => d['id'] == selectedId
      ).toList();
      if (matchingDecisions.isNotEmpty) {
        selectedDecision = QuestDecision.fromJson(matchingDecisions.first);
      }
    }
    
    return Quest(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      storyText: json['storyText'],
      difficulty: QuestDifficulty.values.byName(json['difficulty']),
      type: QuestType.values.byName(json['type']),
      realmId: json['realmId'],
      timelineNodeId: json['timelineNodeId'],
      decisions: (json['decisions'] as List).map((decision) => QuestDecision.fromJson(decision)).toList(),
      resourceRequirements: Map<String, int>.from(json['resourceRequirements']),
      metadata: json['metadata'] ?? {},
      imageUrl: json['imageUrl'],
      isActive: json['isActive'] ?? true,
      isCompleted: json['isCompleted'] ?? false,
      completedByPlayerId: json['completedByPlayerId'],
      selectedDecisionId: json['selectedDecisionId'],
      status: json['status'] != null ? QuestStatusExtension.fromString(json['status']) : QuestStatus.pending,
      turnDue: json['turnDue'] != null ? DateTime.parse(json['turnDue']) : null,
      outcome: json['outcome'] != null ? QuestOutcome.fromJson(json['outcome']) : null,
      selectedDecision: selectedDecision,
      failureOutcome: json['failureOutcome'] != null ? QuestOutcome.fromJson(json['failureOutcome']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'storyText': storyText,
      'difficulty': difficulty.name,
      'type': type.name,
      'realmId': realmId,
      'timelineNodeId': timelineNodeId,
      'decisions': decisions.map((decision) => decision.toJson()).toList(),
      'resourceRequirements': resourceRequirements,
      'metadata': metadata,
      'imageUrl': imageUrl,
      'isActive': isActive,
      'isCompleted': isCompleted,
      'completedByPlayerId': completedByPlayerId,
      'selectedDecisionId': selectedDecisionId,
      'status': status.name,
      'turnDue': turnDue?.toIso8601String(),
      'outcome': outcome?.toJson(),
      'failureOutcome': failureOutcome?.toJson(),
    };
  }

  Quest copyWith({
    String? id,
    String? title,
    String? description,
    String? storyText,
    QuestDifficulty? difficulty,
    QuestType? type,
    String? realmId,
    String? timelineNodeId,
    List<QuestDecision>? decisions,
    Map<String, int>? resourceRequirements,
    Map<String, dynamic>? metadata,
    String? imageUrl,
    bool? isActive,
    bool? isCompleted,
    String? completedByPlayerId,
    String? selectedDecisionId,
    QuestStatus? status,
    DateTime? turnDue,
    QuestOutcome? outcome,
    QuestDecision? selectedDecision,
    QuestOutcome? failureOutcome,
  }) {
    return Quest(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      storyText: storyText ?? this.storyText,
      difficulty: difficulty ?? this.difficulty,
      type: type ?? this.type,
      realmId: realmId ?? this.realmId,
      timelineNodeId: timelineNodeId ?? this.timelineNodeId,
      decisions: decisions ?? this.decisions,
      resourceRequirements: resourceRequirements ?? this.resourceRequirements,
      metadata: metadata ?? this.metadata,
      imageUrl: imageUrl ?? this.imageUrl,
      isActive: isActive ?? this.isActive,
      isCompleted: isCompleted ?? this.isCompleted,
      completedByPlayerId: completedByPlayerId ?? this.completedByPlayerId,
      selectedDecisionId: selectedDecisionId ?? this.selectedDecisionId,
      status: status ?? this.status,
      turnDue: turnDue ?? this.turnDue,
      outcome: outcome ?? this.outcome,
      selectedDecision: selectedDecision ?? this.selectedDecision,
      failureOutcome: failureOutcome ?? this.failureOutcome,
    );
  }
}
