# 🌱 EcoTrace - Environmental Impact Tracking App

A React Native mobile application that helps users track eco-friendly habits, participate in community challenges, and monitor their environmental impact through gamified point systems and leaderboards.

![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)
![Expo](https://img.shields.io/badge/Expo-~54.0.7-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-~5.9.2-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 📱 Features

### 🎯 Core Functionality
- **User Authentication** - Secure login/signup system
- **Habit Tracking** - Track 6+ eco-friendly daily habits across 4 categories
- **Impact Points** - Earn points for environmental actions
- **Community Challenges** - Participate in group eco-challenges
- **Leaderboards** - Compare progress with other users
- **Profile Management** - Manage personal eco-profile and achievements

### 🚀 Technical Features
- **Cross-Platform** - iOS and Android support
- **Offline Support** - Works without internet connection with smart caching
- **Real-time Sync** - Live data synchronization when online
- **Pull-to-Refresh** - Update data on all screens
- **Haptic Feedback** - Native touch feedback
- **Error Handling** - Comprehensive error boundaries and user feedback
- **Platform Optimizations** - Native feel on both iOS and Android

## 🛠️ Technology Stack

- **Framework**: React Native with Expo SDK
- **Language**: TypeScript for type safety
- **Navigation**: React Navigation v7 (native stack, bottom tabs)
- **State Management**: React Context with custom hooks
- **Storage**: AsyncStorage for local data persistence
- **Network**: Custom API service with retry logic and caching
- **UI**: Custom components with platform-specific styling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your mobile device

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd EcoTraceRN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator, `i` for iOS simulator

### Alternative Commands
```bash
npm run android    # Start with Android emulator
npm run ios        # Start with iOS simulator  
npm run web        # Start web version
```

## 🧪 Testing the App

### Demo Credentials
- **Email**: `eco@example.com`
- **Password**: `password123`
- **Or use**: "Test Login (Demo)" button

### Test Features
- ✅ Browse and track eco-friendly habits
- ✅ Complete habits to earn impact points
- ✅ Join community challenges
- ✅ View leaderboards and rankings
- ✅ Edit profile and view achievements
- ✅ Test offline functionality
- ✅ Pull-to-refresh on all screens

## 📁 Project Structure

```
EcoTraceRN/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # App screens (auth, main)
│   ├── services/           # API and business logic
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions and utilities
├── assets/                 # Images and static files
├── docs/                   # Documentation
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
└── package.json           # Dependencies and scripts
```

## 🌐 Backend Integration

The app connects to a deployed backend API:
- **Production API**: `https://ecotrace-api.onrender.com`
- **Local Development**: Configurable in `src/config/environment.ts`
- **Data**: Habits, challenges, users, and leaderboards
- **Authentication**: Email/password with session management

## 🎨 App Screens

### Authentication Flow
- **Login Screen** - Email/password authentication
- **Signup Screen** - New user registration
- **Forgot Password** - Password recovery (UI ready)

### Main Application
- **Dashboard** - Overview of stats, habits, and leaderboards
- **Habits** - Browse, track, and complete eco-friendly habits
- **Challenges** - Join community environmental challenges
- **Profile** - User information, achievements, and settings

## 🔧 Configuration

### Environment Settings
Edit `src/config/environment.ts` to configure:
- API endpoints (development vs production)
- Cache durations
- Network timeouts
- Retry attempts

### App Configuration
Edit `app.json` for:
- App name and version
- Expo configuration
- Platform-specific settings
- Asset configuration

## 📊 Current Data

### Habits (6 available)
- **Waste Reduction**: Recycle Plastic, Reusable Water Bottle
- **Transportation**: Use Public Transport
- **Energy Saving**: Turn Off Lights, Unplug Electronics  
- **Food**: Plant-Based Meal

### Challenges (3 available)
- Plastic-Free Week (7 days, 100 points)
- Energy Saving Month (30 days, 250 points)
- Green Commute Challenge (14 days, 150 points)

### Demo Users (5 users)
- Leaderboard with realistic point distributions
- Various tracking patterns for testing

## 🚀 Deployment & Sharing

### Share with Friends
1. Start the development server: `npm start`
2. Share the QR code or Expo link
3. Friends can scan with Expo Go app
4. Works on any network (uses production API)

### Build for Production
```bash
# Build for app stores
expo build:android
expo build:ios

# Or create development build
expo run:android
expo run:ios
```

## 🔮 Future Enhancements

See `docs/FUTURE_ROADMAP.md` for comprehensive development plans:

### Phase 2A: Content Management
- Admin dashboard for managing habits/challenges
- Dynamic content creation without code changes

### Phase 2B: Real User System  
- Database integration (PostgreSQL/SQLite)
- Real user registration and authentication
- Persistent data and real leaderboards

### Phase 2C: Social Features
- User-generated challenges
- Friend system and social sharing
- Achievement badges and streaks

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

### Code Style
- TypeScript strict mode enabled
- ESLint configuration included
- Consistent import organization
- Comprehensive error handling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌍 Environmental Impact

EcoTrace helps users:
- **Track sustainable habits** and build eco-friendly routines
- **Participate in community challenges** for collective environmental action
- **Visualize impact** through points and achievements
- **Stay motivated** through gamification and social features

---

**Built with ❤️ for a sustainable future 🌱**

## 📞 Support

For questions, issues, or feedback:
- Create an issue in this repository
- Check the documentation in `docs/`
- Review the future roadmap for planned features

---

*Ready to make a positive environmental impact? Download Expo Go and start tracking your eco-friendly habits today!*