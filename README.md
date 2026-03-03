# Qurbani Mobile App

A React Native mobile application for managing Hajj Qurbani for individual users and group representatives.

## Features

- User authentication with JWT tokens
- Dashboard showing Qurbani status (Pending, Ready, Done)
- Individual users can mark their Qurbani as ready
- Group representatives can manage multiple members
- Validation for animal capacity (Sheep: 1, Cow: 5, Camel: 7)
- Push notifications for status updates
- Profile management
- Real-time status tracking

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure backend API URL in `src/config/api.js`

3. Run the app:
```bash
# For iOS
npm run ios

# For Android
npm run android

# For web
npm run web
```

## Project Structure

```
src/
  ├── components/      # Reusable UI components
  ├── screens/         # Screen components
  ├── navigation/      # Navigation configuration
  ├── services/        # API services
  ├── contexts/        # React contexts
  ├── utils/           # Utility functions
  └── config/          # Configuration files
```

## Backend API

This app requires a backend API built with Express.js and MongoDB. Ensure the API is running and accessible.

## Environment Variables

Create a `.env` file in the root directory:
```
API_BASE_URL=http://your-backend-api-url
```
