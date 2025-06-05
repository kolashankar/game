enum RealmType {
  tech,
  nature,
  urban,
  voidType,
  mixed
}

extension RealmTypeExtension on RealmType {
  String get name {
    switch (this) {
      case RealmType.tech:
        return 'tech';
      case RealmType.nature:
        return 'nature';
      case RealmType.urban:
        return 'urban';
      case RealmType.voidType:
        return 'void';
      case RealmType.mixed:
        return 'mixed';
    }
  }
  
  String toLowerCase() {
    return name.toLowerCase();
  }
}

class Realm {
  final String id;
  final String name;
  final String description;
  final RealmType type;
  final Map<String, dynamic> metadata;
  final String imageUrl;
  final int stability;

  Realm({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    this.metadata = const {},
    required this.imageUrl,
    this.stability = 100,
  });

  factory Realm.fromJson(Map<String, dynamic> json) {
    return Realm(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Unknown Realm',
      description: json['description'] ?? '',
      type: json['type'] != null
          ? RealmType.values.firstWhere(
              (type) => type.name == json['type'],
              orElse: () => RealmType.mixed)
          : RealmType.mixed,
      metadata: json['metadata'] ?? {},
      imageUrl: json['imageUrl'] ?? '',
      stability: json['stability'] ?? 100,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'type': type.name,
      'metadata': metadata,
      'imageUrl': imageUrl,
      'stability': stability,
    };
  }

  String get primaryResourceType {
    switch (type) {
      case RealmType.tech:
        return 'tech';
      case RealmType.nature:
        return 'nature';
      case RealmType.urban:
        return 'urban';
      case RealmType.voidType:
        return 'void';
      case RealmType.mixed:
        return 'mixed';
    }
  }
}
