import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:arcore_flutter_plugin/arcore_flutter_plugin.dart';
import 'package:vector_math/vector_math_64.dart' as vector;

import '../providers/game_provider.dart';
import '../services/ar_service.dart';

class ARViewScreen extends StatefulWidget {
  final bool isTimeline;
  final String? realmId;
  final String? questId;
  
  const ARViewScreen({
    Key? key,
    this.isTimeline = false,
    this.realmId,
    this.questId,
  }) : super(key: key);

  @override
  State<ARViewScreen> createState() => _ARViewScreenState();
}

class _ARViewScreenState extends State<ARViewScreen> {
  ArCoreController? _arCoreController;
  final ARService _arService = ARService();
  bool _isLoading = true;
  String _errorMessage = '';
  String? _realmId;
  String? _questId;
  bool _isTimeline = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeAR();
    });
  }

  @override
  void dispose() {
    _arCoreController?.dispose();
    super.dispose();
  }

  Future<void> _initializeAR() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = '';
      });

      // Get parameters from widget properties
      _realmId = widget.realmId;
      _questId = widget.questId;
      _isTimeline = widget.isTimeline;

      // Validate parameters
      if (_realmId == null && _questId == null && !_isTimeline) {
        throw Exception('Missing parameters: realmId or questId or isTimeline must be provided');
      }

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
    }
  }

  void _onArCoreViewCreated(ArCoreController controller) {
    _arCoreController = controller;
    
    // Load AR content based on parameters
    if (_realmId != null) {
      _loadRealmAR(_realmId!);
    } else if (_questId != null) {
      _loadQuestAR(_questId!);
    } else if (_isTimeline) {
      _loadTimelineAR();
    }
  }

  Future<void> _loadRealmAR(String realmId) async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = '';
      });

      // Get realm AR models
      final arModels = await _arService.getRealmARModels(realmId);
      
      // Create AR nodes based on models
      for (final model in arModels['models']) {
        await _addNodeToScene(model);
      }

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
    }
  }

  Future<void> _loadQuestAR(String questId) async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = '';
      });

      // Get quest AR models
      final arModels = await _arService.getQuestARModels(questId);
      
      // Create AR nodes based on models
      for (final model in arModels['models']) {
        await _addNodeToScene(model);
      }

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
    }
  }

  Future<void> _loadTimelineAR() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = '';
      });

      final gameProvider = Provider.of<GameProvider>(context, listen: false);
      if (gameProvider.currentGame == null) {
        throw Exception('No active game found');
      }

      // Get timeline AR visualization
      final timelineData = await _arService.getTimelineARVisualization(gameProvider.currentGame!.id);
      
      // Create AR nodes based on timeline data
      for (final node in timelineData['nodes']) {
        await _addTimelineNodeToScene(node);
      }

      // Add connections between nodes
      for (final connection in timelineData['connections']) {
        await _addTimelineConnectionToScene(connection);
      }

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString();
      });
    }
  }

  Future<void> _addNodeToScene(Map<String, dynamic> model) async {
    if (_arCoreController == null) return;

    final position = vector.Vector3(
      model['position']['x'].toDouble(),
      model['position']['y'].toDouble(),
      model['position']['z'].toDouble(),
    );

    final rotation = vector.Vector4(
      model['rotation']['x'].toDouble(),
      model['rotation']['y'].toDouble(),
      model['rotation']['z'].toDouble(),
      model['rotation']['w'].toDouble(),
    );

    final scale = vector.Vector3(
      model['scale']['x'].toDouble(),
      model['scale']['y'].toDouble(),
      model['scale']['z'].toDouble(),
    );

    if (model['type'] == 'object') {
      // Download model if needed
      final modelFile = await _arService.downloadARModel(model['url'], model['fileName']);

      final node = ArCoreReferenceNode(
        name: model['name'],
        objectUrl: modelFile.path,
        position: position,
        rotation: rotation,
        scale: scale,
      );

      await _arCoreController!.addArCoreNode(node);
    } else if (model['type'] == 'sphere') {
      final material = ArCoreMaterial(
        color: _getColorFromHex(model['color']),
        metallic: model['metallic'].toDouble(),
      );

      final sphere = ArCoreSphere(
        materials: [material],
        radius: model['radius'].toDouble(),
      );

      final node = ArCoreNode(
        name: model['name'],
        shape: sphere,
        position: position,
        rotation: rotation,
        scale: scale,
      );

      await _arCoreController!.addArCoreNode(node);
    } else if (model['type'] == 'cylinder') {
      final material = ArCoreMaterial(
        color: _getColorFromHex(model['color']),
        metallic: model['metallic'].toDouble(),
      );

      final cylinder = ArCoreCylinder(
        materials: [material],
        radius: model['radius'].toDouble(),
        height: model['height'].toDouble(),
      );

      final node = ArCoreNode(
        name: model['name'],
        shape: cylinder,
        position: position,
        rotation: rotation,
        scale: scale,
      );

      await _arCoreController!.addArCoreNode(node);
    }
  }

  Future<void> _addTimelineNodeToScene(Map<String, dynamic> node) async {
    if (_arCoreController == null) return;

    final position = vector.Vector3(
      node['position']['x'].toDouble(),
      node['position']['y'].toDouble(),
      node['position']['z'].toDouble(),
    );

    // Determine color based on realm type
    final realmType = node['realmType'];
    final color = _getRealmColor(realmType);

    final material = ArCoreMaterial(
      color: color,
      metallic: 0.5,
    );

    final sphere = ArCoreSphere(
      materials: [material],
      radius: 0.1,
    );

    final arNode = ArCoreNode(
      name: node['id'],
      shape: sphere,
      position: position,
    );

    await _arCoreController!.addArCoreNode(arNode);
  }

  Future<void> _addTimelineConnectionToScene(Map<String, dynamic> connection) async {
    if (_arCoreController == null) return;

    final startPosition = vector.Vector3(
      connection['start']['x'].toDouble(),
      connection['start']['y'].toDouble(),
      connection['start']['z'].toDouble(),
    );

    final endPosition = vector.Vector3(
      connection['end']['x'].toDouble(),
      connection['end']['y'].toDouble(),
      connection['end']['z'].toDouble(),
    );

    // Calculate direction and length
    final direction = endPosition - startPosition;
    final length = direction.length;
    
    // Create normalized direction
    direction.normalize();
    
    // Calculate rotation to align cylinder with direction
    final defaultDirection = vector.Vector3(0, 1, 0);
    final rotationAxis = defaultDirection.cross(direction);
    final rotationAngle = math.acos(defaultDirection.dot(direction));
    final rotation = vector.Quaternion.axisAngle(rotationAxis, rotationAngle);

    // Position is the midpoint between start and end
    final position = (startPosition + endPosition) * 0.5;

    final material = ArCoreMaterial(
      color: Colors.white.withOpacity(0.7),
      metallic: 0.0,
    );

    final cylinder = ArCoreCylinder(
      materials: [material],
      radius: 0.01,
      height: length,
    );

    final arNode = ArCoreNode(
      name: '${connection['sourceId']}_${connection['targetId']}',
      shape: cylinder,
      position: position,
      rotation: vector.Vector4(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w,
      ),
    );

    await _arCoreController!.addArCoreNode(arNode);
  }

  Color _getColorFromHex(String hexColor) {
    hexColor = hexColor.replaceAll('#', '');
    if (hexColor.length == 6) {
      hexColor = 'FF$hexColor';
    }
    return Color(int.parse(hexColor, radix: 16));
  }

  Color _getRealmColor(String realmType) {
    switch (realmType) {
      case 'tech':
        return Colors.blue;
      case 'nature':
        return Colors.green;
      case 'urban':
        return Colors.grey;
      case 'void':
        return Colors.purple;
      default:
        return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AR View'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              if (_realmId != null) {
                _loadRealmAR(_realmId!);
              } else if (_questId != null) {
                _loadQuestAR(_questId!);
              } else if (_isTimeline) {
                _loadTimelineAR();
              }
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // AR View
          ArCoreView(
            onArCoreViewCreated: _onArCoreViewCreated,
            enableTapRecognizer: true,
          ),
          
          // Loading Indicator
          if (_isLoading)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          
          // Error Message
          if (_errorMessage.isNotEmpty)
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.error.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _errorMessage,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          
          // Instructions
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Move your device around to detect surfaces. Tap to place objects.',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
