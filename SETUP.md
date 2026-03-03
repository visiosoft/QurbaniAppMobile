# Qurbani Mobile App - Setup Instructions

## Prerequisites

Before running the app, make sure you have:

1. Node.js (v14 or later) installed
2. npm or yarn package manager
3. Expo CLI installed globally: `npm install -g expo-cli`
4. Expo Go app on your mobile device (iOS or Android)
5. Backend API running (Express.js + MongoDB)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API URL

Edit `src/config/api.js` and update the `API_BASE_URL` with your backend API URL:

```javascript
export const API_BASE_URL = 'http://your-backend-url:3000/api';
```

For local development (using your computer's IP address):
```javascript
export const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

### 3. Start the Development Server

```bash
npm start
```

This will start the Expo development server.

### 4. Run on Device/Emulator

#### iOS (Mac only):
```bash
npm run ios
```

#### Android:
```bash
npm run android
```

#### Using Expo Go App:
1. Install Expo Go on your mobile device
2. Scan the QR code from the terminal
3. The app will load on your device

## Project Structure

```
qurbani-mobile/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   ├── StatusBadge.js
│   │   ├── Loading.js
│   │   └── EmptyState.js
│   ├── config/           # Configuration files
│   │   ├── api.js        # API endpoints and base URL
│   │   ├── constants.js  # App constants (colors, spacing, etc.)
│   │   └── env.js        # Environment configuration
│   ├── contexts/         # React contexts
│   │   └── AuthContext.js # Authentication context
│   ├── navigation/       # Navigation configuration
│   │   ├── RootNavigator.js
│   │   └── MainNavigator.js
│   ├── screens/          # Screen components
│   │   ├── auth/
│   │   │   └── LoginScreen.js
│   │   └── main/
│   │       ├── DashboardScreen.js
│   │       ├── GroupMembersScreen.js
│   │       └── ProfileScreen.js
│   ├── services/         # API services
│   │   ├── apiClient.js  # Axios instance with interceptors
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── qurbaniService.js
│   │   ├── groupService.js
│   │   └── notificationService.js
│   └── utils/            # Utility functions
│       ├── validation.js
│       └── format.js
├── App.js                # Main app entry point
├── package.json
├── app.json              # Expo configuration
└── babel.config.js
```

## Backend API Requirements

Your backend API should implement the following endpoints:

### Authentication
- `POST /api/auth/login` - Login with phoneNumber and passportNumber
- `POST /api/auth/logout` - Logout

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Qurbani
- `GET /api/qurbani/status` - Get Qurbani status
- `POST /api/qurbani/mark-ready` - Mark Qurbani as ready
- `GET /api/qurbani/details/:id` - Get Qurbani details

### Group Management (for group representatives)
- `GET /api/group/members` - Get all group members
- `POST /api/group/member/mark-ready` - Mark member as ready
- `POST /api/group/validate` - Validate group capacity

## Features Implemented

### Authentication
- ✅ Login with phone number and passport number
- ✅ JWT token authentication
- ✅ Auto-login on app restart
- ✅ Logout functionality

### Dashboard
- ✅ Display current Qurbani status
- ✅ View user information
- ✅ Mark individual Qurbani as ready
- ✅ Status indicators (Pending, Ready, Done)
- ✅ Pull-to-refresh

### Group Management (for group representatives)
- ✅ View list of group members
- ✅ Mark individual members as ready
- ✅ Validation for animal capacity limits
  - Sheep: 1 person
  - Cow: 5 people
  - Camel: 7 people
- ✅ Visual capacity indicators

### Profile
- ✅ View personal information
- ✅ Edit phone number
- ✅ Notification preferences
- ✅ View Qurbani details

### Notifications
- ✅ Push notification setup
- ✅ In-app notification handling
- ✅ Notification preferences toggle

### UI/UX
- ✅ Clean, modern interface
- ✅ Status badges with color coding
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Responsive design

## Validation Rules

### Client-Side Validation
1. **Phone Number**: Must be at least 10 digits
2. **Passport Number**: Must be at least 6 characters
3. **Group Capacity**: Cannot mark more members than allowed per animal type
4. **Required Fields**: All required fields must be filled

### Animal Capacity Limits
- **Sheep**: Maximum 1 person
- **Cow**: Maximum 5 people
- **Camel**: Maximum 7 people

## Navigation Structure

```
Root
├── Login (if not authenticated)
└── Main (if authenticated)
    ├── Dashboard (Tab)
    ├── Members (Tab - only for group accounts)
    └── Profile (Tab)
```

## Customization

### Colors
Edit `src/config/constants.js` to customize the color scheme:

```javascript
export const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#4CAF50',
  // ... more colors
};
```

### API Endpoints
Edit `src/config/api.js` to add or modify API endpoints.

### Validation Rules
Edit `src/utils/validation.js` to modify validation logic.

## Troubleshooting

### Cannot connect to backend API
- Ensure your backend server is running
- Use your computer's IP address instead of `localhost`
- Check firewall settings
- Verify the API URL in `src/config/api.js`

### Notifications not working
- Ensure you're using a physical device (notifications don't work in simulators)
- Check notification permissions are granted
- Verify Expo notification configuration in `app.json`

### App crashes on start
- Clear Expo cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for syntax errors in the code

## Testing

### Test Accounts
Create test accounts in your backend with different scenarios:
- Individual account with pending status
- Individual account with ready status
- Group account with multiple members
- Group account at capacity limit

### Test Cases
1. Login with valid credentials
2. Login with invalid credentials
3. Mark individual Qurbani as ready
4. Mark group members as ready
5. Attempt to exceed capacity limit
6. Edit profile information
7. Toggle notification preferences
8. Logout and re-login

## Dependencies

Key dependencies used in this project:
- `react-native`: Mobile framework
- `expo`: Development platform
- `@react-navigation/native`: Navigation
- `@react-navigation/stack`: Stack navigation
- `@react-navigation/bottom-tabs`: Tab navigation
- `axios`: HTTP client
- `@react-native-async-storage/async-storage`: Local storage
- `expo-notifications`: Push notifications

## Next Steps

1. **Backend Integration**: Connect to your actual backend API
2. **Testing**: Test all features thoroughly
3. **Push Notifications**: Set up backend to send push notifications
4. **Error Handling**: Add more comprehensive error handling
5. **Offline Support**: Implement offline data caching
6. **Analytics**: Add analytics tracking
7. **App Store Deployment**: Prepare for production deployment

## Support

For issues or questions:
1. Check the console logs for errors
2. Verify backend API is responding correctly
3. Review the code comments for implementation details
4. Test with different user scenarios

## License

This project is for educational/demonstration purposes.
