# ChronoCore Companion App

Mobile companion application for the ChronoCore: Path of Realities board game.

## Overview

The ChronoCore Companion App enhances the physical board game experience by providing:

- Augmented Reality (AR) visualizations of game elements
- Real-time game state synchronization
- Player profile management
- QR code scanning for easy game joining
- Timeline and realm visualizations

## Tech Stack

- **Framework**: Flutter
- **State Management**: Provider
- **AR Integration**: ARCore
- **API Communication**: HTTP + Socket.IO
- **Authentication**: JWT + Secure Storage
- **UI Components**: Custom widgets with Tailwind-inspired design

## Project Structure

```
mobile/
├── assets/               # Static assets
│   ├── fonts/            # Custom fonts
│   ├── icons/            # SVG icons
│   └── images/           # Images and illustrations
├── lib/                  # Dart code
│   ├── main.dart         # Entry point
│   └── src/              # Source code
│       ├── app.dart      # App configuration
│       ├── config/       # App configuration
│       ├── models/       # Data models
│       ├── providers/    # State management
│       ├── screens/      # UI screens
│       ├── services/     # API services
│       ├── utils/        # Utility functions
│       └── widgets/      # Reusable UI components
├── pubspec.yaml          # Dependencies
└── .env                  # Environment variables
```

## Features

### Authentication
- User registration and login
- Secure token storage
- Profile management

### Game Management
- Create new games
- Join existing games via code or QR scan
- View active games
- Game lobby with player readiness status

### Gameplay
- Real-time game state updates
- Timeline visualization
- Quest management
- Resource tracking
- Decision making interface

### AR Features
- Realm visualization in AR
- Timeline node visualization
- Quest elements in AR
- 3D model rendering of game pieces

### Settings
- Theme customization
- Notification preferences
- Sound and haptic feedback settings
- AR cache management

## Getting Started

1. Ensure you have Flutter installed and set up
2. Clone the repository
3. Install dependencies:
   ```
   flutter pub get
   ```
4. Configure environment variables in `.env`
5. Run the app:
   ```
   flutter run
   ```

## AR Requirements

- Android device with ARCore support
- iOS device with ARKit support (iOS implementation pending)
- Sufficient storage space for AR model caching

## Connecting to Game Server

The app connects to the ChronoCore game server for:
- Authentication
- Game state synchronization
- AR model retrieval

Configure the server URL in the `.env` file.

## Development

The app follows a clean architecture approach with:
- Models for data representation
- Services for API communication
- Providers for state management
- Screens for UI presentation

## Contributing

Follow the standard Git workflow:
1. Create a feature branch
2. Implement changes
3. Submit a pull request

## License

Copyright © 2025 ChronoCore Games
