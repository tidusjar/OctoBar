# OctoBar - GitHub Notifications Menu Bar App

A macOS menu bar application built with Electron + React + TypeScript that provides a filtered inbox for GitHub notifications.

## Features

- **Menu Bar Integration**: Tray icon with unread notification badge count
- **Native macOS Styling**: Dropdown menu styled like native macOS menus
- **Smart Grouping**: Notifications grouped by Repository
- **Rich Notifications**: Shows title, type (PR, issue, review request, mention), and relative time
- **Quick Actions**: Mark as read, Open in browser, Mute thread, Star/Prioritize
- **Smart Filters**: Work, Personal, and All views
- **GitHub API Integration**: Real-time notifications from GitHub API
- **Setup Wizard**: Guided setup for GitHub Personal Access Token
- **Secure Storage**: PAT stored securely using macOS Keychain
- **Real-time Updates**: Live notification loading and status updates
- **Error Handling**: Graceful error handling with retry functionality
- **Offline Caching**: Cache last 100 notifications for quick loading

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
│   │   └── SetupWizard.tsx
│   │   └── setup/       # Setup wizard steps
│   │       ├── WelcomeStep.tsx
│   │       ├── PATStep.tsx
│   │       ├── FilterStep.tsx
│   │       └── CompletionStep.tsx
│   ├── services/        # Data services
│   │   └── githubService.ts
│   ├── types/           # TypeScript type definitions
│   │   └── notifications.ts
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
- macOS (for native menu bar integration)

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

1. Start the development server:
```bash
npm run dev
```

This will:
- Start the Vite dev server for the React app
- Compile the TypeScript main process
- Launch the Electron app

2. The app will appear in your menu bar with a tray icon
3. Click the icon to open the dropdown with GitHub notifications

### Building

1. Build for production:
```bash
npm run build
```

2. Create distributable:
```bash
npm run dist
```

## Current Implementation Status

### ✅ Completed
- Electron main process with tray app and popup window
- React frontend with component structure
- GitHub API integration with real notifications
- Personal Access Token setup wizard
- Secure PAT storage using macOS Keychain
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

### 🔄 In Progress
- Filter implementation (Work/Personal views need backend logic)
- Mute thread functionality (UI ready, API integration pending)
- Star thread functionality (UI ready, API integration pending)

### 📋 TODO
- Implement Work/Personal filter logic based on organization/repository
- Add mute thread API integration
- Add star thread API integration
- Add notification refresh polling
- Add settings window for account management
- Implement macOS Focus mode detection
- Add notification sound alerts
- Add keyboard shortcuts
- Add notification search functionality

## GitHub Integration

The app now integrates with the real GitHub API:

- **Authentication**: Uses Personal Access Token (PAT) stored securely in macOS Keychain
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

## Architecture

### Main Process (Electron)
- Manages the system tray and popup window
- Handles app lifecycle and window management
- Provides secure IPC communication via preload script
- Manages secure storage of GitHub PAT using keytar

### Renderer Process (React)
- Renders the notification UI
- Manages component state and user interactions
- Communicates with main process via electronAPI
- Handles GitHub API calls through GitHubService

### Data Flow
1. GitHubService fetches real notifications from GitHub API
2. App component manages global state and notification grouping
3. Components render notifications with proper grouping and styling
4. User actions trigger service methods for real API calls
5. UI updates reflect real-time state changes

## Styling

The app uses:
- CSS custom properties for consistent theming
- Backdrop filters for modern macOS aesthetics
- Responsive design principles
- Native macOS color palette
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
