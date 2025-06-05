import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../config/routes.dart';
import '../providers/game_provider.dart';
import '../models/player.dart';
import '../services/ar_service.dart';

class GameScannerScreen extends StatefulWidget {
  const GameScannerScreen({Key? key}) : super(key: key);

  @override
  State<GameScannerScreen> createState() => _GameScannerScreenState();
}

class _GameScannerScreenState extends State<GameScannerScreen> {
  final MobileScannerController _controller = MobileScannerController();
  bool _isProcessing = false;
  String _errorMessage = '';
  final ARService _arService = ARService();
  PlayerRole _selectedRole = PlayerRole.technoMonk;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing || capture.barcodes.isEmpty) return;
    
    final barcode = capture.barcodes.first;
    if (barcode.rawValue == null) return;
    
    setState(() {
      _isProcessing = true;
      _errorMessage = '';
    });
    
    try {
      // Pause the camera
      await _controller.stop();
      
      // Process the QR code
      final gameCode = await _arService.processQRCode(barcode.rawValue!);
      
      // Show role selection dialog
      if (mounted) {
        _showRoleSelectionDialog(gameCode);
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isProcessing = false;
      });
      
      // Resume the camera after error
      await _controller.start();
    }
  }

  void _showRoleSelectionDialog(String gameCode) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            title: const Text('Select Your Role'),
            content: SizedBox(
              height: 300,
              width: double.maxFinite,
              child: Column(
                children: [
                  const Text('Choose your role for this game:'),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView.builder(
                      itemCount: PlayerRole.values.length,
                      itemBuilder: (context, index) {
                        final role = PlayerRole.values[index];
                        final isSelected = role == _selectedRole;
                        
                        return ListTile(
                          title: Text(role.name.split(RegExp('(?=[A-Z])')).join(' ')),
                          leading: Radio<PlayerRole>(
                            value: role,
                            groupValue: _selectedRole,
                            onChanged: (value) {
                              setDialogState(() {
                                _selectedRole = value!;
                              });
                            },
                          ),
                          selected: isSelected,
                          onTap: () {
                            setDialogState(() {
                              _selectedRole = role;
                            });
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  _controller.start();
                  setState(() {
                    _isProcessing = false;
                  });
                },
                child: const Text('CANCEL'),
              ),
              ElevatedButton(
                onPressed: () async {
                  Navigator.of(context).pop();
                  
                  try {
                    final gameProvider = Provider.of<GameProvider>(context, listen: false);
                    final success = await gameProvider.joinGame(gameCode, _selectedRole);
                    
                    if (success && mounted) {
                      Navigator.of(context).pushReplacementNamed(Routes.gameDetails);
                    } else {
                      // If joining failed, resume camera
                      await _controller.start();
                      setState(() {
                        _isProcessing = false;
                        _errorMessage = gameProvider.errorMessage;
                      });
                    }
                  } catch (e) {
                    // If an error occurred, resume camera
                    await _controller.start();
                    setState(() {
                      _isProcessing = false;
                      _errorMessage = e.toString();
                    });
                  }
                },
                child: const Text('JOIN GAME'),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Game QR Code'),
      ),
      body: Stack(
        children: [
          // QR Scanner
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),
          
          // Scanner overlay
          CustomPaint(
            painter: ScannerOverlay(
              borderColor: Theme.of(context).colorScheme.primary,
              scannerSize: 300,
              borderRadius: 10,
            ),
            child: const SizedBox.expand(),
          ),
          
          // Instructions
          Positioned(
            top: 16,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              color: Colors.black54,
              child: const Text(
                'Scan the QR code displayed on the game board or shared by the host',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                ),
                textAlign: TextAlign.center,
              ),
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
                  color: Theme.of(context).colorScheme.error.withValues(alpha: Theme.of(context).colorScheme.error.alpha * 0.8),
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
          
          // Loading Indicator
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }
}

// Custom painter for scanner overlay
class ScannerOverlay extends CustomPainter {
  final Color borderColor;
  final double scannerSize;
  final double borderRadius;

  ScannerOverlay({
    required this.borderColor,
    required this.scannerSize,
    required this.borderRadius,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final scannerRect = Rect.fromCenter(
      center: Offset(size.width / 2, size.height / 2),
      width: scannerSize,
      height: scannerSize,
    );
    
    final backgroundPath = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height));
    
    final cutoutPath = Path()
      ..addRRect(
        RRect.fromRectAndRadius(
          scannerRect,
          Radius.circular(borderRadius),
        ),
      );
    
    final finalPath = Path.combine(
      PathOperation.difference,
      backgroundPath,
      cutoutPath,
    );
    
    canvas.drawPath(
      finalPath,
      Paint()..color = Colors.black54,
    );
    
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        scannerRect,
        Radius.circular(borderRadius),
      ),
      Paint()
        ..color = borderColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return false;
  }
}
