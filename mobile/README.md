# Hospital Bill Calculator - React Native Mobile App

This is the mobile version of the Hospital Bill Calculator, built with React Native.

## Features

- **Professional Medical Billing**: Calculate bills for outpatient and inpatient services
- **Real-time Synchronization**: Syncs with the web application's backend API
- **Native Mobile Experience**: Optimized for Android devices
- **Medical Theme**: Professional dark green medical theme with glass morphism effects
- **Comprehensive Database**: Browse and search medical items by category
- **Bangladeshi Taka Support**: All prices displayed in ৳ currency

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Main application screens
│   │   ├── HomeScreen.tsx
│   │   ├── OutpatientScreen.tsx
│   │   ├── InpatientScreen.tsx
│   │   └── DatabaseScreen.tsx
│   ├── services/         # API service layer
│   │   └── api.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── currency.ts
│   └── App.tsx          # Main app component
├── android/             # Android-specific files
└── package.json         # Dependencies and scripts
```

## Setup Instructions

### Prerequisites

1. Node.js (version 18 or higher)
2. Android Studio with Android SDK
3. Java Development Kit (JDK 17)
4. React Native CLI

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Metro bundler:
   ```bash
   npm start
   ```

4. In a new terminal, run the Android app:
   ```bash
   npm run android
   ```

### Configuration

1. **API Connection**: Update the `API_BASE_URL` in `src/services/api.ts` to point to your server
2. **App Name**: Modify the app name in `android/app/src/main/res/values/strings.xml`
3. **Package Name**: Update the package name in `android/app/build.gradle` and related files

## Screens Overview

### Home Screen
- Welcome screen with navigation to main features
- Professional medical theme with feature highlights
- Quick access to Outpatient, Inpatient, and Database sections

### Outpatient Screen
- Category-based medical item selection
- Real-time bill calculation with category totals
- Support for all outpatient medical categories
- Bill management (add/remove items, clear bill)

### Inpatient Screen
- Comprehensive inpatient medical categories
- Daily rate calculations for bed charges and services
- Advanced medical procedures and specialized care options
- Integrated bill management system

### Database Screen
- Browse all medical items in the database
- Search functionality with real-time filtering
- Category-based filtering with item counts
- Database statistics and overview

## Technical Features

### API Integration
- RESTful API calls to Express.js backend
- Async/await pattern for all API operations
- Error handling with user-friendly alerts
- Offline support with AsyncStorage caching

### State Management
- React hooks for local state management
- Real-time data synchronization
- Optimistic updates for better UX

### UI/UX Design
- React Native Paper components for Material Design
- Professional medical color scheme
- Responsive design for various screen sizes
- Glass morphism effects and modern styling

### Navigation
- React Navigation 6 with native stack navigation
- Type-safe navigation with TypeScript
- Consistent header styling across screens

## Development Guidelines

1. **Code Style**: Follow React Native and TypeScript best practices
2. **Error Handling**: Always wrap API calls in try-catch blocks
3. **Performance**: Use React.memo and useMemo for optimization
4. **Accessibility**: Include accessibility labels for screen readers
5. **Testing**: Write unit tests for utility functions and components

## Deployment

### Debug Build
```bash
cd android && ./gradlew assembleDebug
```

### Release Build
```bash
cd android && ./gradlew assembleRelease
```

## Integration with Web App

The mobile app shares the same backend API as the web application:
- Same database and medical items
- Synchronized bill management
- Consistent business logic
- Real-time data updates

## Future Enhancements

- Push notifications for bill updates
- Offline mode with full functionality
- Barcode scanning for medical items
- Print bill functionality
- Multi-language support
- Dark/light theme toggle