# OctoBar - GitHub Notifications Menu Bar App

A macOS menu bar application built with Electron + React + TypeScript that provides a filtered inbox for GitHub notifications.

## Features

- **Menu Bar Integration**: Tray icon with unread notification badge count
- **Native macOS Styling**: Dropdown menu styled like native macOS menus
- **Smart Grouping**: Notifications grouped by Organization → Repository
- **Rich Notifications**: Shows title, type (PR, issue, review request, mention), and relative time
- **Quick Actions**: Mark as read, Open in browser, Mute thread, Star/Prioritize
- **Smart Filters**: Work (specific orgs), Personal, and All views
- **Multiple Accounts**: Support for multiple GitHub accounts
- **Focus Mode Integration**: Sync with macOS Focus mode (stub implementation)
- **Offline Caching**: Cache last 50 notifications for quick loading

## Project Structure

```
src/
├── main/                 # Electron main process
│   ├── main.ts         # Main process entry point
│   └── preload.ts      # Preload script for secure IPC
├── renderer/            # React renderer process
│   ├── components/      # React components
│   │   ├── Header.tsx
│   │   ├── FilterBar.tsx
│   │   ├── NotificationList.tsx
│   │   ├── NotificationItem.tsx
│   │   └── QuickActions.tsx
│   ├── services/        # Data services
│   │   └── mockDataService.ts
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
3. Click the icon to open the dropdown with mock notifications

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
- Electron main process with tray app
- React frontend with component structure
- Mock notification data service
- TypeScript type definitions
- Native macOS-style UI components
- Quick action buttons (mark as read, open, mute, star)
- Filter system (Work, Personal, All)
- Responsive design with proper styling

### 🔄 In Progress
- GitHub API integration (placeholder)
- Focus mode integration (stub)
- Offline caching (structure ready)

### 📋 TODO
- Connect to GitHub Notifications API
- Implement authentication flow
- Add SQLite/local storage for offline caching
- Implement macOS Focus mode detection
- Add settings window for account management
- Implement actual quick actions (mute, star)
- Add notification refresh polling
- Error handling and retry logic

## Mock Data

The app currently uses mock data that includes:
- Sample organizations (Microsoft, Facebook, personal)
- Various notification types (issues, PRs, review requests)
- Different notification reasons (assign, mention, review_requested)
- Realistic timestamps and repository information

## Architecture

### Main Process (Electron)
- Manages the system tray and popup window
- Handles app lifecycle and window management
- Provides secure IPC communication via preload script

### Renderer Process (React)
- Renders the notification UI
- Manages component state and user interactions
- Communicates with main process via electronAPI

### Data Flow
1. MockDataService provides sample notifications
2. App component manages global state
3. Components render notifications with proper grouping
4. User actions trigger service methods
5. UI updates reflect state changes

## Styling

The app uses:
- CSS custom properties for consistent theming
- Backdrop filters for modern macOS aesthetics
- Responsive design principles
- Native macOS color palette
- Smooth transitions and hover effects

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript strict mode
3. Implement proper error handling
4. Add tests for new functionality
5. Update documentation as needed

## License

MIT License - see LICENSE file for details
