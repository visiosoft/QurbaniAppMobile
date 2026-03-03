# API Integration Guide

This document provides detailed information about integrating the mobile app with your Express.js backend.

## Base URL Configuration

Update the API base URL in `src/config/api.js`:

```javascript
export const API_BASE_URL = 'http://your-backend-url:3000/api';
```

For local development, use your computer's local IP address:
```javascript
export const API_BASE_URL = 'http://192.168.1.100:3000/api';
```

## API Endpoints

### Authentication Endpoints

#### 1. Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "passportNumber": "AB123456"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "phoneNumber": "+1234567890",
    "passportNumber": "AB123456",
    "qurbaniType": "cow",
    "accountType": "individual",
    "status": "pending"
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid credentials"
}
```

#### 2. Logout
```
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### User Endpoints

#### 1. Get User Profile
```
GET /api/user/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "passportNumber": "AB123456",
  "qurbaniType": "cow",
  "accountType": "individual",
  "status": "pending"
}
```

#### 2. Update User Profile
```
PUT /api/user/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "passportNumber": "AB123456",
  "qurbaniType": "cow",
  "accountType": "individual",
  "status": "pending"
}
```

---

### Qurbani Endpoints

#### 1. Get Qurbani Status
```
GET /api/qurbani/status
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200) - Individual:**
```json
{
  "status": "pending",
  "qurbaniType": "cow",
  "updatedAt": "2024-03-01T10:00:00Z"
}
```

**Response (200) - Group:**
```json
{
  "status": "pending",
  "qurbaniType": "cow",
  "memberCount": 5,
  "readyCount": 3,
  "updatedAt": "2024-03-01T10:00:00Z"
}
```

#### 2. Mark Qurbani as Ready
```
POST /api/qurbani/mark-ready
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (optional):**
```json
{
  "userId": "user_id"
}
```

**Response (200):**
```json
{
  "message": "Qurbani marked as ready",
  "status": "ready",
  "updatedAt": "2024-03-01T10:00:00Z"
}
```

#### 3. Get Qurbani Details
```
GET /api/qurbani/details/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "qurbani_id",
  "userId": "user_id",
  "name": "John Doe",
  "passportNumber": "AB123456",
  "qurbaniType": "cow",
  "status": "ready",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-03-01T10:00:00Z"
}
```

---

### Group Management Endpoints

#### 1. Get Group Members
```
GET /api/group/members
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "members": [
    {
      "_id": "member_id_1",
      "name": "Member 1",
      "phoneNumber": "+1234567891",
      "passportNumber": "AB123457",
      "qurbaniType": "cow",
      "status": "ready"
    },
    {
      "_id": "member_id_2",
      "name": "Member 2",
      "phoneNumber": "+1234567892",
      "passportNumber": "AB123458",
      "qurbaniType": "cow",
      "status": "pending"
    }
  ],
  "qurbaniType": "cow",
  "totalMembers": 5,
  "readyMembers": 3
}
```

#### 2. Mark Member as Ready
```
POST /api/group/member/mark-ready
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "memberId": "member_id"
}
```

**Response (200):**
```json
{
  "message": "Member marked as ready",
  "member": {
    "_id": "member_id",
    "name": "Member 1",
    "status": "ready",
    "updatedAt": "2024-03-01T10:00:00Z"
  }
}
```

**Error (400) - Capacity Exceeded:**
```json
{
  "message": "Maximum 5 members allowed for cow"
}
```

#### 3. Validate Group Capacity
```
POST /api/group/validate
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "qurbaniType": "cow",
  "currentReadyCount": 4
}
```

**Response (200):**
```json
{
  "valid": true,
  "message": "4 of 5 members marked as ready",
  "maxAllowed": 5,
  "currentCount": 4
}
```

---

## Authentication Flow

1. User enters phone number and passport number
2. App sends POST request to `/api/auth/login`
3. Backend validates credentials and returns JWT token
4. App stores token in AsyncStorage
5. All subsequent requests include token in Authorization header
6. If token expires (401 response), app automatically logs out user

---

## Error Handling

All API errors should follow this format:

```json
{
  "message": "Error description",
  "error": "Optional error code or details"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/expired token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Push Notifications

### Register Device Token

When a user enables notifications, the app will send the device token to your backend:

```
POST /api/user/register-device
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxx]"
}
```

**Response (200):**
```json
{
  "message": "Device registered successfully"
}
```

### Send Notification (Backend)

When admin marks a Qurbani as done, send push notification:

```javascript
const sendPushNotification = async (expoPushToken) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Qurbani Completed',
    body: 'Your Qurbani has been successfully completed!',
    data: { type: 'qurbani_done' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};
```

---

## Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  phoneNumber: String,
  passportNumber: String,
  qurbaniType: String, // 'sheep', 'cow', 'camel'
  accountType: String, // 'individual', 'group'
  status: String, // 'pending', 'ready', 'done'
  createdAt: Date,
  updatedAt: Date
}
```

### Member Schema (for group accounts)
```javascript
{
  _id: ObjectId,
  groupId: ObjectId,
  name: String,
  phoneNumber: String,
  passportNumber: String,
  qurbaniType: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing API Integration

Use tools like:
- Postman
- Insomnia
- Thunder Client (VS Code extension)
- cURL

Example cURL request:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+1234567890","passportNumber":"AB123456"}'
```

---

## Security Best Practices

1. **HTTPS**: Use HTTPS in production
2. **CORS**: Configure CORS properly on backend
3. **Rate Limiting**: Implement rate limiting on API
4. **Input Validation**: Validate all inputs on backend
5. **Token Expiration**: Set reasonable JWT expiration time
6. **Secure Storage**: Tokens are stored securely in AsyncStorage

---

## Environment Variables

Backend should use environment variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/qurbani
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
```

---

## CORS Configuration (Backend)

```javascript
const cors = require('cors');

app.use(cors({
  origin: '*', // Update for production
  credentials: true,
}));
```

---

## Additional Notes

- All dates should be in ISO 8601 format
- Phone numbers should include country code
- Passport numbers should be uppercase
- Status values must be: 'pending', 'ready', or 'done'
- Qurbani types must be: 'sheep', 'cow', or 'camel'
- Account types must be: 'individual' or 'group'
