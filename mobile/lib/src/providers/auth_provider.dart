import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

enum AuthStatus {
  initial,
  authenticated,
  unauthenticated,
  authenticating,
  error
}

class AuthProvider with ChangeNotifier {
  final AuthService _authService;
  
  AuthStatus _status = AuthStatus.initial;
  User? _currentUser;
  String _errorMessage = '';

  AuthProvider(this._authService) {
    // Check if user is already logged in
    _checkCurrentUser();
  }

  // Getters
  AuthStatus get status => _status;
  User? get currentUser => _currentUser;
  String get errorMessage => _errorMessage;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  // Check if user is already logged in
  Future<void> _checkCurrentUser() async {
    try {
      _status = AuthStatus.authenticating;
      notifyListeners();
      
      final user = await _authService.getCurrentUser();
      
      if (user != null) {
        _currentUser = user;
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (e) {
      _status = AuthStatus.error;
      _errorMessage = e.toString();
    } finally {
      notifyListeners();
    }
  }

  // Register a new user
  Future<bool> register(String username, String email, String password, String preferredRole) async {
    try {
      _status = AuthStatus.authenticating;
      _errorMessage = '';
      notifyListeners();
      
      final user = await _authService.register(username, email, password, preferredRole);
      
      _currentUser = user;
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } catch (e) {
      _status = AuthStatus.error;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Login user
  Future<bool> login(String email, String password) async {
    try {
      _status = AuthStatus.authenticating;
      _errorMessage = '';
      notifyListeners();
      
      final user = await _authService.login(email, password);
      
      _currentUser = user;
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } catch (e) {
      _status = AuthStatus.error;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Logout user
  Future<void> logout() async {
    try {
      await _authService.logout();
      _currentUser = null;
      _status = AuthStatus.unauthenticated;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // Update user profile
  Future<bool> updateProfile(Map<String, dynamic> updates) async {
    try {
      if (_currentUser == null) return false;
      
      final user = await _authService.updateProfile(_currentUser!.id, updates);
      
      _currentUser = user;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Clear error
  void clearError() {
    _errorMessage = '';
    notifyListeners();
  }
}
