# Mobile Authentication Testing Guide

## Issue Resolution Summary

### Problem
- **Error**: Network error in Expo mobile app when trying to login
- **Cause**: Mobile app was configured to connect to `192.168.1.9:5000`, but the backend server is running on `192.168.1.8:5000`

### Solution
- ✅ Updated API configuration in `src/config/api.js` to use correct IP: `192.168.1.8`
- ✅ Verified backend API is working correctly
- ✅ Created comprehensive test suite

---

## Test Credentials

| Field | Value |
|-------|-------|
| Phone Number | `123456` |
| Passport Number | `123456` |
| Expected User | `alkhaleej` |

---

## Test Files

### 1. Backend API Test
**File**: `g:\Qurbani App\backend\test-mobile-auth.js`

**Purpose**: Test the backend authentication endpoint directly

**Usage**:
```bash
cd "g:\Qurbani App\backend"
node test-mobile-auth.js
```

**Features**:
- Tests `/api/auth/authenticate` endpoint
- Validates response structure
- Checks auth token, user data, and qurbani data
- Provides detailed error messages

---

### 2. Comprehensive Test Suite
**File**: `g:\Qurbani Mobile\__tests__\auth.test.js`

**Purpose**: Complete end-to-end authentication testing

**Usage**:
```bash
cd "g:\Qurbani Mobile"
node __tests__\auth.test.js
```

**Test Coverage**:
1. ✅ Network connectivity
2. ✅ Valid user authentication
3. ✅ Invalid credentials handling
4. ✅ Token expiration validation
5. ✅ Response data structure
6. ✅ JWT token format
7. ✅ Error handling

**Test Results**: 17/17 tests passed (100% success rate)

---

## API Configuration

### Current Setup
```javascript
// File: g:\Qurbani Mobile\src\config\api.js
export const API_BASE_URL = 'http://192.168.1.8:5000';
```

### If Your IP Changes
1. Find your computer's IP address:
   ```powershell
   Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias '*Wi-Fi*'
   ```

2. Update `src/config/api.js`:
   ```javascript
   export const API_BASE_URL = 'http://YOUR_IP_HERE:5000';
   ```

3. Run tests to verify:
   ```bash
   node __tests__\auth.test.js
   ```

---

## API Response Format

### Successful Authentication
```json
{
  "success": true,
  "message": "Authentication successful",
  "authToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "69a36026cbdd0d7174986745",
    "name": "alkhaleej",
    "passportNumber": "123456",
    "phoneNumber": "123456",
    "qurbaniType": "Cow",
    "accountType": "group",
    "status": "ready",
    "groupId": {...},
    "createdAt": "2026-02-28T21:37:42.513Z"
  },
  "qurbani": {
    "id": "69a36026cbdd0d7174986747",
    "qurbaniType": "Sheep",
    "accountType": "individual",
    "status": "pending",
    "createdAt": "2026-02-28T21:37:42.753Z",
    "completedAt": null,
    "notes": ""
  }
}
```

### Error Response
```json
{
  "error": "Invalid credentials",
  "message": "Phone number not found"
}
```

---

## Troubleshooting

### Network Error in Mobile App

1. **Check Backend Server**:
   ```bash
   cd "g:\Qurbani App\backend"
   node server.js
   ```

2. **Verify IP Address**:
   - Computer IP: `192.168.1.8`
   - Mobile app should use same IP
   - Both devices must be on same WiFi network

3. **Test Backend API**:
   ```bash
   cd "g:\Qurbani App\backend"
   node test-mobile-auth.js
   ```

4. **Run Mobile Test Suite**:
   ```bash
   cd "g:\Qurbani Mobile"
   node __tests__\auth.test.js
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Connection refused" | Backend server not running |
| "Network timeout" | Wrong IP address or firewall blocking |
| "Phone number not found" | User doesn't exist in database |
| "Passport number does not match" | Wrong credentials |
| "No auth token received" | Backend JWT configuration issue |

---

## Running the Mobile App

1. **Ensure Backend is Running**:
   ```bash
   cd "g:\Qurbani App\backend"
   node server.js
   ```

2. **Start Expo**:
   ```bash
   cd "g:\Qurbani Mobile"
   npx expo start
   ```

3. **Login with Test Credentials**:
   - Phone: `123456`
   - Passport: `123456`

---

## Next Steps

### For Development Build (Recommended)
The warning about Expo Go limitations suggests using a development build:
```bash
npx expo install expo-dev-client
npx expo run:android
# or
npx expo run:ios
```

### For Production
1. Test authentication thoroughly
2. Update API_BASE_URL to production server
3. Implement proper error handling
4. Add retry logic for network failures

---

## Quick Commands

```bash
# Test backend API
cd "g:\Qurbani App\backend" ; node test-mobile-auth.js

# Run full test suite
cd "g:\Qurbani Mobile" ; node __tests__\auth.test.js

# Start backend server
cd "g:\Qurbani App\backend" ; node server.js

# Start mobile app
cd "g:\Qurbani Mobile" ; npx expo start

# Check your IP address
Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias '*Wi-Fi*'
```

---

## Files Modified

1. ✅ `g:\Qurbani Mobile\src\config\api.js` - Updated IP from 192.168.1.9 to 192.168.1.8
2. ✅ `g:\Qurbani App\backend\test-mobile-auth.js` - Created backend API test
3. ✅ `g:\Qurbani Mobile\__tests__\auth.test.js` - Created comprehensive test suite

---

**Status**: ✅ All tests passing - Mobile app is ready to use!  
**Date**: March 9, 2026
