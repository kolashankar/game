import '../models/player.dart';

/// Helper class for asset paths
class AssetHelper {
  /// Get the correct icon path for a player role
  static String getRoleIconPath(PlayerRole role) {
    switch (role) {
      case PlayerRole.technoMonk:
        return 'assets/icons/techno-monk-icon.svg';
      case PlayerRole.bioSmith:
        return 'assets/icons/bio-smith-icon.svg';
      case PlayerRole.chronoDiplomat:
        return 'assets/icons/chrono-diplomat-icon.svg';
      case PlayerRole.shadowBroker:
        return 'assets/icons/shadow-broker-icon.svg';
      default:
        return 'assets/icons/techno-monk-icon.svg';
    }
  }

  /// Get the correct icon path for a resource type
  static String getResourceIconPath(String resourceType) {
    switch (resourceType.toLowerCase()) {
      case 'tech':
        return 'assets/icons/tech-icon.svg';
      case 'nature':
        return 'assets/icons/nature-icon.svg';
      case 'urban':
        return 'assets/icons/urban-icon.svg';
      case 'void':
        return 'assets/icons/void-icon.svg';
      default:
        return 'assets/icons/tech-icon.svg';
    }
  }
}
