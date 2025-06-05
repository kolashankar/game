enum TimelineNodeStatus {
  active,
  inactive,
  completed,
  locked,
  hidden
}

extension TimelineNodeStatusExtension on TimelineNodeStatus {
  String get name {
    switch (this) {
      case TimelineNodeStatus.active:
        return 'active';
      case TimelineNodeStatus.inactive:
        return 'inactive';
      case TimelineNodeStatus.completed:
        return 'completed';
      case TimelineNodeStatus.locked:
        return 'locked';
      case TimelineNodeStatus.hidden:
        return 'hidden';
    }
  }
  
  String toUpperCase() {
    return name.toUpperCase();
  }
  
  String asString() {
    return name;
  }
  
  static TimelineNodeStatus fromString(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return TimelineNodeStatus.active;
      case 'inactive':
        return TimelineNodeStatus.inactive;
      case 'completed':
        return TimelineNodeStatus.completed;
      case 'locked':
        return TimelineNodeStatus.locked;
      case 'hidden':
        return TimelineNodeStatus.hidden;
      default:
        return TimelineNodeStatus.inactive;
    }
  }
}

class TimelineNode {
  final String id;
  final String name;
  final String title;
  final int year;
  final TimelineNodeStatus status;
  final String description;
  final List<String> connectedNodeIds;
  final Map<String, dynamic> metadata;
  final bool isStartNode;
  final bool isEndNode;
  final String realmId;

  TimelineNode({
    required this.id,
    required this.name,
    required this.title,
    required this.year,
    this.status = TimelineNodeStatus.inactive,
    required this.description,
    required this.connectedNodeIds,
    this.metadata = const {},
    this.isStartNode = false,
    this.isEndNode = false,
    required this.realmId,
  });

  factory TimelineNode.fromJson(Map<String, dynamic> json) {
    return TimelineNode(
      id: json['id'],
      name: json['name'],
      title: json['title'] ?? 'Unknown Event',
      year: json['year'] ?? 2050,
      status: json['status'] != null
          ? TimelineNodeStatusExtension.fromString(json['status'])
          : TimelineNodeStatus.inactive,
      description: json['description'],
      connectedNodeIds: List<String>.from(json['connectedNodeIds']),
      metadata: json['metadata'] ?? {},
      isStartNode: json['isStartNode'] ?? false,
      isEndNode: json['isEndNode'] ?? false,
      realmId: json['realmId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'title': title,
      'year': year,
      'status': status.name,
      'description': description,
      'connectedNodeIds': connectedNodeIds,
      'metadata': metadata,
      'isStartNode': isStartNode,
      'isEndNode': isEndNode,
      'realmId': realmId,
    };
  }
}

class Timeline {
  final String id;
  final String gameId;
  final String name;
  final String description;
  final List<TimelineNode> nodes;
  final String startNodeId;
  final List<String> endNodeIds;
  final Map<String, dynamic> metadata;
  final int stability;

  Timeline({
    required this.id,
    required this.gameId,
    required this.name,
    required this.description,
    required this.nodes,
    required this.startNodeId,
    required this.endNodeIds,
    this.metadata = const {},
    this.stability = 100,
  });

  factory Timeline.fromJson(Map<String, dynamic> json) {
    return Timeline(
      id: json['id'],
      gameId: json['gameId'],
      name: json['name'],
      description: json['description'],
      nodes: (json['nodes'] as List)
          .map((node) => TimelineNode.fromJson(node))
          .toList(),
      startNodeId: json['startNodeId'],
      endNodeIds: List<String>.from(json['endNodeIds']),
      metadata: json['metadata'] ?? {},
      stability: json['stability'] ?? 100,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'gameId': gameId,
      'name': name,
      'description': description,
      'nodes': nodes.map((node) => node.toJson()).toList(),
      'startNodeId': startNodeId,
      'endNodeIds': endNodeIds,
      'metadata': metadata,
      'stability': stability,
    };
  }

  TimelineNode? getNodeById(String nodeId) {
    try {
      return nodes.firstWhere((node) => node.id == nodeId);
    } catch (e) {
      return null;
    }
  }

  List<TimelineNode> getConnectedNodes(String nodeId) {
    final node = getNodeById(nodeId);
    if (node == null) return [];
    
    return nodes.where((n) => node.connectedNodeIds.contains(n.id)).toList();
  }
}
