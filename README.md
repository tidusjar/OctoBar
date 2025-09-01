# OctoBar - GitHub Notifications Menu Bar App

A cross-platform menu bar/system tray application built with Electron + React + TypeScript that provides a filtered inbox for GitHub notifications.

**Supported Platforms:**
- macOS (menu bar integration)
- Windows (system tray integration)

## Features

- **System Tray Integration**: Tray icon with unread notification badge count (macOS) and context menu (Windows)
- **Cross-Platform Styling**: Native-like dropdown menu styled for both macOS and Windows
- **Smart Grouping**: Notifications grouped by Repository
- **Rich Notifications**: Shows title, type (PR, issue, review request, mention), and relative time
- **Quick Actions**: Mark as read, Open in browser, Mute thread, Star/Prioritize
- **Smart Filters**: Work, Personal, and All views
- **GitHub API Integration**: Real-time notifications from GitHub API
- **Setup Wizard**: Guided setup for GitHub Personal Access Token
- **Secure Storage**: PAT stored securely using system keychain (macOS Keychain/Windows Credential Manager)
- **Real-time Updates**: Live notification loading and status updates
- **Error Handling**: Graceful error handling with retry functionality
- **Offline Caching**: Cache last 100 notifications for quick loading
- **Background Refresh**: Automatic notification updates at configurable intervals (1-60 minutes)
- **Desktop Notifications**: Native desktop notifications with sound alerts
- **Notification Settings**: Configurable sound and desktop notification preferences
- **Debug Mode**: Hidden developer tools for testing and troubleshooting
- **Theme Support**: Light, dark, and system theme modes
- **Filter Management**: Advanced filtering by organizations and repositories

## Project Structure

```
src/
├── main/                 # Electron main process
│   ├── main.ts         # Main process entry point
│   ├── preload.ts      # Preload script for secure IPC
│   └── secureStorage.ts # Secure PAT storage using keytar
├── renderer/            # React renderer process
│   ├── components/      # React components
│   │   ├── Header.tsx
│   │   ├── FilterBar.tsx
│   │   ├── NotificationList.tsx
│   │   ├── NotificationItem.tsx
│   │   ├── QuickActions.tsx
│   │   ├── SetupWizard.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── FilterSettingsModal.tsx
│   │   └── setup/       # Setup wizard steps
│   │       ├── WelcomeStep.tsx
│   │       ├── PATStep.tsx
│   │       ├── FilterStep.tsx
│   │       └── CompletionStep.tsx
│   ├── services/        # Data services
│   │   ├── githubService.ts
│   │   └── notificationService.ts
│   ├── contexts/        # React contexts
│   │   └── ThemeContext.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useBackgroundRefresh.ts
│   ├── types/           # TypeScript type definitions
│   │   ├── notifications.ts
│   │   ├── electron.d.ts
│   │   └── electron-api.d.ts
│   ├── App.tsx          # Main React component
│   ├── main.tsx         # React entry point
│   ├── index.html       # HTML template
│   └── App.css          # Styles
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript config for renderer
├── tsconfig.main.json   # TypeScript config for main process
└── vite.config.ts       # Vite build configuration
```

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- **macOS** (for native menu bar integration) or **Windows** (for system tray integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd OctoBar
```

2. Install dependencies:
```bash
npm install
```

3. Create a placeholder icon:
   - Replace `src/renderer/assets/icon.png` with a 16x16 or 32x32 PNG icon
   - The app will fallback to a default icon if none is provided

### Development

#### macOS/Linux
1. Start the development server:
```bash
npm run dev
```

#### Windows
1. Start the development server using the Windows script:
```batch
scripts\dev.bat
```

Or manually:
```bash
npm run dev
```

This will:
- Start the Vite dev server for the React app
- Compile the TypeScript main process
- Launch the Electron app

2. The app will appear in your menu bar (macOS) or system tray (Windows) with a tray icon
3. **macOS**: Click the icon to open the dropdown with GitHub notifications
4. **Windows**: Left-click to open notifications, right-click for context menu

### Building

1. Build for production:
```bash
npm run build
```

2. Create distributable:

**For current platform:**
```bash
npm run dist
```

**For Windows specifically:**
```bash
npm run dist:win
```

**For macOS specifically:**
```bash
npm run dist:mac
```

This will create platform-specific installers:
- **Windows**: Creates an NSIS installer (`.exe`) in the `release` folder
- **macOS**: Creates a DMG file in the `release` folder

## Current Implementation Status

### ✅ Completed
- Electron main process with tray app and popup window
- Cross-platform support (macOS and Windows)
- React frontend with component structure
- GitHub API integration with real notifications
- Personal Access Token setup wizard
- Secure PAT storage using system keychain (macOS Keychain/Windows Credential Manager)
- TypeScript type definitions
- Native macOS-style UI components
- Quick action buttons (mark as read, open in browser)
- Filter system (Work, Personal, All)
- Responsive design with proper styling
- Real-time notification loading
- Error handling and retry functionality
- Notification grouping by repository
- Mark as read functionality (individual and bulk)
- Refresh notifications functionality
- **Background refresh system** with configurable intervals (1-60 minutes)
- **Desktop notifications** with native Electron notification API
- **Sound notifications** with custom audio generation
- **Settings management** with persistent storage
- **Theme system** (light, dark, system)
- **Advanced filtering** by organizations and repositories
- **Debug mode** with comprehensive testing tools
- **Notification permission handling** with user-friendly UI

### 🔄 In Progress
- Filter implementation (Work/Personal views need backend logic)
- Mute thread functionality (UI ready, API integration pending)
- Star thread functionality (UI ready, API integration pending)

### 📋 TODO
- Implement Work/Personal filter logic based on organization/repository
- Add mute thread API integration
- Add star thread API integration
- Implement macOS Focus mode detection
- Add keyboard shortcuts
- Add notification search functionality
- Add notification history/archive
- Add notification categories and custom filters

## GitHub Integration

The app now integrates with the real GitHub API:

- **Authentication**: Uses Personal Access Token (PAT) stored securely in system keychain
- **API Endpoints**: Fetches notifications from GitHub Notifications API
- **Real-time Data**: Loads actual unread notifications from your GitHub account
- **Smart URL Building**: Automatically generates proper GitHub URLs for different notification types
- **Rate Limiting**: Respects GitHub API rate limits
- **Error Handling**: Graceful handling of API errors with user-friendly messages

## Setup Wizard

New users are guided through a setup process:

1. **Welcome**: Introduction to the app
2. **GitHub Token**: Enter and validate your Personal Access Token
3. **Filters**: Configure notification filters (Work/Personal)
4. **Completion**: Setup complete, ready to use

The wizard validates your PAT and ensures it has the necessary permissions for notifications.

## Notification System

OctoBar includes a comprehensive notification system with both visual and audio alerts:

### Desktop Notifications
- **Native Integration**: Uses Electron's native notification API for proper desktop integration
- **Click to Focus**: Clicking notifications brings the app to focus
- **Auto-dismiss**: Notifications automatically close after 5 seconds
- **Permission Handling**: Automatic permission requests with user-friendly UI

### Sound Notifications
- **Custom Audio**: Generates custom notification sounds using Web Audio API
- **No External Files**: Sounds are generated programmatically, no audio files required
- **Configurable**: Can be enabled/disabled in settings

### Background Refresh
- **Automatic Updates**: Fetches new notifications at configurable intervals
- **Smart Detection**: Only shows notifications for new notifications (count increases)
- **Configurable Intervals**: Choose from 1, 5, 15, 30, or 60 minutes
- **Settings Integration**: Refresh interval is saved and restored between sessions

### Settings Management
- **Persistent Storage**: All settings are saved securely and restored on app restart
- **Real-time Updates**: Settings changes take effect immediately
- **Theme Support**: Light, dark, and system theme modes
- **Filter Management**: Advanced filtering by organizations and repositories

## Debug Mode

OctoBar includes a hidden debug mode for developers and power users:

### Activation
1. Open the Settings modal
2. Click the "Settings" title 5 times
3. Debug mode will activate (title will turn orange and show a wrench emoji)

### Debug Tools
- **Notification Testing**: Test different types of notifications
- **Force Notifications**: Bypass settings to test notification functionality
- **Permission Checking**: Check and request notification permissions
- **Settings Logging**: View current settings and notification status
- **Manual Refresh**: Force manual notification refresh
- **Comprehensive Logging**: Detailed console output for troubleshooting

### Use Cases
- **Development**: Test notification functionality during development
- **Troubleshooting**: Diagnose notification issues
- **User Testing**: Verify notification functionality works correctly
- **Demo Purposes**: Show notification features to others

## Secure Storage

### Cross-Platform Credential Storage

OctoBar uses the `keytar` library to securely store your GitHub Personal Access Token (PAT) in the operating system's native credential store:

- **macOS**: Stored in macOS Keychain (`/Applications/Utilities/Keychain Access.app`)
- **Windows**: Stored in Windows Credential Manager (`Control Panel > Credential Manager > Windows Credentials`)
- **Linux**: Stored in libsecret/gnome-keyring

#### Windows Credential Manager Details

On Windows, your PAT will appear in Credential Manager as:
- **Internet or network address**: `OctoBar`
- **User name**: `GitHub_PAT`
- **Password**: Your encrypted GitHub Personal Access Token

You can view/manage this credential by:
1. Opening **Control Panel** → **Credential Manager**
2. Clicking **Windows Credentials**
3. Looking for the **OctoBar** entry

The credential is encrypted using Windows' built-in encryption and is only accessible to your user account.

## Architecture

### Main Process (Electron)
- Manages the system tray and popup window with cross-platform support
- Handles app lifecycle and window management
- Provides secure IPC communication via preload script
- Manages secure storage of GitHub PAT using keytar (supports both macOS Keychain and Windows Credential Manager)
- **Native Notifications**: Handles desktop notifications using Electron's Notification API
- **Settings Management**: Stores and retrieves application settings securely

### Renderer Process (React)
- Renders the notification UI with theme support
- Manages component state and user interactions
- Communicates with main process via electronAPI
- Handles GitHub API calls through GitHubService
- **Background Refresh**: Automatic notification updates using custom hooks
- **Notification Service**: Manages sound and desktop notifications
- **Settings UI**: Comprehensive settings management with real-time updates

### Data Flow
1. **Background Refresh**: useBackgroundRefresh hook triggers periodic updates
2. **GitHubService**: Fetches real notifications from GitHub API
3. **NotificationService**: Detects new notifications and triggers alerts
4. **App Component**: Manages global state and notification grouping
5. **Components**: Render notifications with proper grouping and styling
6. **User Actions**: Trigger service methods for real API calls
7. **UI Updates**: Reflect real-time state changes and theme updates

## Styling

The app uses:
- CSS custom properties for consistent theming
- Backdrop filters for modern aesthetics (macOS-style)
- Responsive design principles
- Cross-platform color palette with native system integration
- Smooth transitions and hover effects
- Professional setup wizard styling with animations

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript strict mode
3. Implement proper error handling
4. Add tests for new functionality
5. Update documentation as needed

## License

MIT License - see LICENSE file for details
