# BuzzBreach Mobile App

A React Native (Expo) mobile application for BuzzBreach - Your Career, Your Way.

## 🚀 Features

- **Job Hunting** - Browse, search, and apply for jobs
- **Events** - Discover and register for career events
- **Profile Management** - Complete professional profile
- **Authentication** - Secure login via Keycloak OAuth2
- **Real-time Updates** - Stay connected with notifications

## 📱 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: Redux Toolkit
- **Authentication**: Keycloak (OAuth2 + PKCE)
- **HTTP Client**: Axios
- **Icons**: @expo/vector-icons (Ionicons)
- **Storage**: Expo SecureStore

## 📁 Project Structure

```
bfm/
├── App.js                    # Main app entry point
├── app.json                  # Expo configuration
├── assets/                   # Static assets (icons, images)
├── src/
│   ├── api/                  # API layer
│   │   ├── config.js         # API & Keycloak configuration
│   │   ├── apiClient.js      # Axios instance with interceptors
│   │   └── services/         # API service modules
│   │       ├── authService.js
│   │       ├── jobsService.js
│   │       ├── eventsService.js
│   │       └── userService.js
│   ├── components/           # Reusable components
│   │   ├── common/           # Generic components
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Card.js
│   │   │   ├── Avatar.js
│   │   │   ├── Badge.js
│   │   │   ├── Loading.js
│   │   │   └── EmptyState.js
│   │   ├── jobs/             # Job-specific components
│   │   │   └── JobCard.js
│   │   └── events/           # Event-specific components
│   │       └── EventCard.js
│   ├── navigation/           # Navigation setup
│   │   └── AppNavigator.js
│   ├── screens/              # App screens
│   │   ├── auth/
│   │   │   └── LoginScreen.js
│   │   ├── home/
│   │   │   └── HomeScreen.js
│   │   ├── jobs/
│   │   │   ├── JobsScreen.js
│   │   │   └── JobDetailScreen.js
│   │   ├── events/
│   │   │   └── EventsScreen.js
│   │   └── profile/
│   │       └── ProfileScreen.js
│   ├── store/                # Redux store
│   │   ├── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── jobsSlice.js
│   │       ├── eventsSlice.js
│   │       └── profileSlice.js
│   └── theme/                # Theme & styling
│       └── colors.js
└── package.json
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd bfm
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoints:**
   
   Edit `src/api/config.js` and update:
   ```javascript
   export const API_CONFIG = {
     BASE_URL: 'http://YOUR_BACKEND_IP:5000/api/v1',
   };
   
   export const KEYCLOAK_CONFIG = {
     REALM: 'buzzbreach',
     CLIENT_ID: 'buzzbreach-mobile',
     SERVER_URL: 'http://YOUR_KEYCLOAK_IP:8080',
   };
   ```

   **Note:** 
   - For Android emulator, use `10.0.2.2` for localhost
   - For iOS simulator, use `localhost`
   - For physical device, use your computer's IP address

4. **Start the development server:**
   ```bash
   npm start
   # or
   npx expo start
   ```

5. **Run on device/emulator:**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 🔧 Configuration

### Backend API

The app connects to the BuzzBreach backend (`bbm` folder). Make sure the backend is running:

```bash
cd ../bbm
npm start
```

### Keycloak Setup

1. Create a new client in Keycloak for mobile:
   - Client ID: `buzzbreach-mobile`
   - Access Type: `public`
   - Valid Redirect URIs: `buzzbreach://auth`
   - Enable: Standard Flow, Direct Access Grants

2. Update the configuration in `src/api/config.js`

## 📱 Running the App

### Development Mode

```bash
# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web (limited support)
npm run web
```

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android
eas build -p android

# Build for iOS
eas build -p ios
```

## 🎨 Color Theme

The app uses BuzzBreach's brand colors:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#0000A0` | Headers, links |
| Secondary | `#DF7B01` | Buttons, accents |
| Background | `#FFFFFF` | Main background |
| Text Primary | `#25324B` | Main text |
| Text Secondary | `#52575C` | Muted text |
| Success | `#10B981` | Success states |
| Error | `#EF4444` | Error states |

## 🔒 Security

- JWT tokens stored in Expo SecureStore (encrypted)
- PKCE flow for OAuth2 authentication
- Automatic token refresh handling
- Secure API requests with Bearer token

## 📝 Available Screens

| Screen | Description |
|--------|-------------|
| Login | Keycloak OAuth2 authentication |
| Home | Dashboard with quick actions |
| Jobs | Job listings with search/filter |
| Job Detail | Full job information & apply |
| Events | Upcoming events list |
| Profile | User profile with tabs |

## 🤝 API Integration

The app integrates with these backend endpoints:

- `/user/*` - User management
- `/corporate/job/*` - Job operations
- `/corporate/event/*` - Event operations
- `/corporate/page/*` - Company pages

## 📄 License

Private - BuzzBreach

## 👥 Authors

- BuzzBreach Development Team
