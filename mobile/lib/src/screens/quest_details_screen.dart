import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../models/quest.dart';
import '../widgets/loading_overlay.dart';

class QuestDetailsScreen extends StatefulWidget {
  final String questId;

  const QuestDetailsScreen({
    Key? key,
    required this.questId,
  }) : super(key: key);

  @override
  State<QuestDetailsScreen> createState() => _QuestDetailsScreenState();
}

class _QuestDetailsScreenState extends State<QuestDetailsScreen> {
  bool _isLoading = false;
  Quest? _quest;

  @override
  void initState() {
    super.initState();
    
    // Load quest details when screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadQuestDetails();
    });
  }

  Future<void> _loadQuestDetails() async {
    final gameProvider = Provider.of<GameProvider>(context, listen: false);
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      final quest = await gameProvider.getQuestDetails(widget.questId);
      setState(() {
        _quest = quest;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load quest details: ${e.toString()}')),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _makeDecision(String decisionId) async {
    if (_quest == null) return;
    
    final gameProvider = Provider.of<GameProvider>(context, listen: false);
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      await gameProvider.makeQuestDecision(_quest!.id, decisionId);
      
      // Reload quest details after decision
      await _loadQuestDetails();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Decision submitted successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit decision: ${e.toString()}')),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
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
          title: const Text('Quest Details'),
        ),
        body: const Center(
          child: Text('Game not found'),
        ),
      );
    }
    
    return LoadingOverlay(
      isLoading: _isLoading,
      child: Scaffold(
        appBar: AppBar(
          title: Text(_quest?.title ?? 'Quest Details'),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _loadQuestDetails,
            ),
          ],
        ),
        body: _quest == null
            ? const Center(child: Text('Loading quest details...'))
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Quest Header
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Quest Icon and Title
                            Row(
                              children: [
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    color: _getQuestTypeColor(_quest!.type.name),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(
                                    _quest!.type == QuestType.tech ? Icons.memory :
                                    _quest!.type == QuestType.nature ? Icons.eco :
                                    _quest!.type == QuestType.urban ? Icons.location_city :
                                    _quest!.type == QuestType.voidType ? Icons.blur_circular :
                                    Icons.question_mark,
                                    color: Colors.white,
                                    size: 32,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        _quest!.title,
                                        style: Theme.of(context).textTheme.headlineSmall,
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                            decoration: BoxDecoration(
                                              color: _getQuestStatusColor(_quest!.status),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            child: Text(
                                              _quest!.status.name.toUpperCase(),
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            'Due: Turn ${_quest!.turnDue}',
                                            style: Theme.of(context).textTheme.bodySmall,
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Quest Description
                            Text(
                              _quest!.description,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Decisions Section
                    if (_quest!.decisions.isNotEmpty && _quest!.status == QuestStatus.active) ...[                      
                      Text(
                        'Make Your Decision',
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Decision Cards
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _quest!.decisions.length,
                        itemBuilder: (context, index) {
                          final decision = _quest!.decisions[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    decision.title,
                                    style: Theme.of(context).textTheme.titleMedium,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    decision.description,
                                    style: Theme.of(context).textTheme.bodyMedium,
                                  ),
                                  const SizedBox(height: 16),
                                  
                                  // Decision Impact Preview
                                  if (decision.karmaImpact != 0 ||
                                      decision.techImpact != 0 ||
                                      decision.natureImpact != 0 ||
                                      decision.urbanImpact != 0 ||
                                      decision.voidImpact != 0) ...[                                    
                                    const Text(
                                      'Potential Impact:',
                                      style: TextStyle(fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(height: 8),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 8,
                                      children: [
                                        if (decision.karmaImpact != 0)
                                          _buildImpactChip(
                                            'Karma ${decision.karmaImpact > 0 ? '+' : ''}${decision.karmaImpact}',
                                            Icons.star,
                                            Colors.amber,
                                          ),
                                        if (decision.techImpact != 0)
                                          _buildImpactChip(
                                            'Tech ${decision.techImpact > 0 ? '+' : ''}${decision.techImpact}',
                                            Icons.memory,
                                            Colors.blue,
                                          ),
                                        if (decision.natureImpact != 0)
                                          _buildImpactChip(
                                            'Nature ${decision.natureImpact > 0 ? '+' : ''}${decision.natureImpact}',
                                            Icons.eco,
                                            Colors.green,
                                          ),
                                        if (decision.urbanImpact != 0)
                                          _buildImpactChip(
                                            'Urban ${decision.urbanImpact > 0 ? '+' : ''}${decision.urbanImpact}',
                                            Icons.location_city,
                                            Colors.orange,
                                          ),
                                        if (decision.voidImpact != 0)
                                          _buildImpactChip(
                                            'Void ${decision.voidImpact > 0 ? '+' : ''}${decision.voidImpact}',
                                            Icons.blur_circular,
                                            Colors.purple,
                                          ),
                                      ],
                                    ),
                                  ],
                                  
                                  const SizedBox(height: 16),
                                  
                                  // Choose Button
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton(
                                      onPressed: () => _makeDecision(decision.id),
                                      style: ElevatedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                      ),
                                      child: const Text('CHOOSE THIS OPTION'),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                    
                    // Completed Quest Result
                    if (_quest!.status == QuestStatus.completed && _quest!.selectedDecision != null) ...[                      
                      Text(
                        'Your Decision',
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      
                      const SizedBox(height: 16),
                      
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _quest!.selectedDecision!.title,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _quest!.selectedDecision!.description,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                              
                              if (_quest!.outcome != null && _quest!.outcome!.isNotEmpty) ...[                                
                                const SizedBox(height: 16),
                                const Divider(),
                                const SizedBox(height: 16),
                                
                                Text(
                                  'Outcome',
                                  style: Theme.of(context).textTheme.titleMedium,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _quest!.outcome!.description,
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ],
                    
                    // Failed Quest
                    if (_quest!.status == QuestStatus.failed) ...[                      
                      Text(
                        'Quest Failed',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: Colors.red,
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      Card(
                        color: Colors.red.withValues(alpha: (Colors.red.alpha * 0.1)),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'This quest was not completed in time.',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              if (_quest!.failureOutcome != null && _quest!.failureOutcome!.isNotEmpty)
                                Text(_quest!.failureOutcome!.description),
                            ],
                          ),
                        ),
                      ),
                    ],
                    
                    const SizedBox(height: 24),
                    
                    // View in AR Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).pushNamed(
                            '/ar-view',
                            arguments: {
                              'isTimeline': false,
                              'questId': _quest!.id,
                            },
                          );
                        },
                        icon: const Icon(Icons.view_in_ar),
                        label: const Text('VIEW IN AR'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
  
  Widget _buildImpactChip(String label, IconData icon, Color color) {
    return Chip(
      avatar: Icon(icon, color: color, size: 16),
      label: Text(label),
      backgroundColor: color.withValues(alpha: (color.alpha * 0.1)),
      labelStyle: TextStyle(color: color),
    );
  }
  
  Color _getQuestTypeColor(String type) {
    switch (type.toLowerCase()) {
      case 'tech':
        return Colors.blue;
      case 'nature':
        return Colors.green;
      case 'urban':
        return Colors.orange;
      case 'void':
        return Colors.purple;
      case 'mixed':
        return Colors.amber;
      default:
        return Colors.grey;
    }
  }
  
  Color _getQuestStatusColor(QuestStatus status) {
    switch (status) {
      case QuestStatus.active:
        return Colors.blue;
      case QuestStatus.completed:
        return Colors.green;
      case QuestStatus.failed:
        return Colors.red;
      case QuestStatus.expired:
        return Colors.red.shade300;
      case QuestStatus.pending:
      default:
        return Colors.grey;
    }
  }
}
