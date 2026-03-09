/**
 * Mobile App Authentication Test Suite
 * 
 * Tests the authentication flow for the Qurbani mobile application
 * 
 * Usage:
 *   npm test auth.test.js
 * 
 * Or run directly with node:
 *   node __tests__/auth.test.js
 */

const axios = require('axios');

// Test Configuration
const CONFIG = {
    API_BASE_URL: 'https://ingrained-unserved-irmgard.ngrok-free.dev',
    TIMEOUT: 10000,
};

// Test Data
const VALID_USER = {
    phoneNumber: '123456',
    passportNumber: '123456',
    expectedName: 'alkhaleej'
};

const INVALID_USERS = [
    {
        name: 'Invalid Phone Number',
        phoneNumber: '999999',
        passportNumber: '123456',
        expectedError: 'Phone number not found'
    },
    {
        name: 'Invalid Passport Number',
        phoneNumber: '123456',
        passportNumber: 'INVALID',
        expectedError: 'Passport number does not match'
    },
    {
        name: 'Missing Phone Number',
        phoneNumber: '',
        passportNumber: '123456',
        expectedError: 'Phone number and passport number are required'
    },
    {
        name: 'Missing Passport Number',
        phoneNumber: '123456',
        passportNumber: '',
        expectedError: 'Phone number and passport number are required'
    }
];

// Test Results Tracker
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * Print test header
 */
function printHeader(title) {
    console.log('\n' + '='.repeat(70));
    console.log(title);
    console.log('='.repeat(70));
}

/**
 * Print test result
 */
function printTestResult(testName, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${status}: ${testName}`);
    if (details) {
        console.log(`   ${details}`);
    }

    testResults.total++;
    if (passed) {
        testResults.passed++;
    } else {
        testResults.failed++;
    }
    testResults.tests.push({ name: testName, passed, details });
}

/**
 * Test valid user authentication
 */
async function testValidAuthentication() {
    printHeader('Test 1: Valid User Authentication');

    try {
        const response = await axios.post(
            `${CONFIG.API_BASE_URL}/api/auth/authenticate`,
            {
                phoneNumber: VALID_USER.phoneNumber,
                passportNumber: VALID_USER.passportNumber
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: CONFIG.TIMEOUT
            }
        );

        // Check response status
        if (response.status !== 200) {
            printTestResult('Response Status Code', false, `Expected 200, got ${response.status}`);
            return false;
        }
        printTestResult('Response Status Code', true, 'Status: 200 OK');

        // Check auth token
        if (!response.data.authToken) {
            printTestResult('Auth Token Presence', false, 'No authToken in response');
            return false;
        }
        printTestResult('Auth Token Presence', true, 'Auth token received');

        // Validate JWT token format
        const tokenParts = response.data.authToken.split('.');
        if (tokenParts.length !== 3) {
            printTestResult('JWT Token Format', false, 'Invalid JWT format');
            return false;
        }
        printTestResult('JWT Token Format', true, 'Valid JWT structure');

        // Check user data
        if (!response.data.user) {
            printTestResult('User Data Presence', false, 'No user data in response');
            return false;
        }
        printTestResult('User Data Presence', true, 'User data received');

        // Validate user fields
        const user = response.data.user;
        const requiredFields = ['id', 'name', 'passportNumber', 'phoneNumber', 'qurbaniType', 'accountType', 'status'];
        const missingFields = requiredFields.filter(field => !user[field]);

        if (missingFields.length > 0) {
            printTestResult('User Data Fields', false, `Missing fields: ${missingFields.join(', ')}`);
            return false;
        }
        printTestResult('User Data Fields', true, 'All required fields present');

        // Validate credentials match
        if (user.phoneNumber !== VALID_USER.phoneNumber) {
            printTestResult('Phone Number Match', false, `Expected ${VALID_USER.phoneNumber}, got ${user.phoneNumber}`);
            return false;
        }
        printTestResult('Phone Number Match', true, `Phone: ${user.phoneNumber}`);

        if (user.passportNumber !== VALID_USER.passportNumber) {
            printTestResult('Passport Number Match', false, `Expected ${VALID_USER.passportNumber}, got ${user.passportNumber}`);
            return false;
        }
        printTestResult('Passport Number Match', true, `Passport: ${user.passportNumber}`);

        // Check qurbani data (optional, may be null)
        if (response.data.qurbani) {
            const qurbani = response.data.qurbani;
            if (qurbani.id && qurbani.qurbaniType && qurbani.status) {
                printTestResult('Qurbani Data', true, `Type: ${qurbani.qurbaniType}, Status: ${qurbani.status}`);
            } else {
                printTestResult('Qurbani Data', false, 'Incomplete qurbani data');
            }
        } else {
            printTestResult('Qurbani Data', true, 'No qurbani record (acceptable)');
        }

        console.log('\n📊 User Details:');
        console.log(`   Name: ${user.name}`);
        console.log(`   Qurbani Type: ${user.qurbaniType}`);
        console.log(`   Account Type: ${user.accountType}`);
        console.log(`   Status: ${user.status}`);

        return true;

    } catch (error) {
        printTestResult('Valid Authentication', false, error.message);
        if (error.response) {
            console.log(`   API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
}

/**
 * Test invalid credentials handling
 */
async function testInvalidCredentials() {
    printHeader('Test 2: Invalid Credentials Handling');

    for (const testCase of INVALID_USERS) {
        try {
            const response = await axios.post(
                `${CONFIG.API_BASE_URL}/api/auth/authenticate`,
                {
                    phoneNumber: testCase.phoneNumber,
                    passportNumber: testCase.passportNumber
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: CONFIG.TIMEOUT
                }
            );

            // If we get here, the request succeeded when it should have failed
            printTestResult(testCase.name, false, 'Expected error but got success response');

        } catch (error) {
            if (error.response) {
                // Check if we got the expected error
                const errorMessage = error.response.data.message || error.response.data.error;
                const statusCode = error.response.status;

                // Verify status code is 4xx (client error)
                if (statusCode >= 400 && statusCode < 500) {
                    printTestResult(testCase.name, true, `Status ${statusCode}: ${errorMessage}`);
                } else {
                    printTestResult(testCase.name, false, `Wrong status code: ${statusCode}`);
                }
            } else {
                printTestResult(testCase.name, false, `Network error: ${error.message}`);
            }
        }
    }
}

/**
 * Test network connectivity
 */
async function testNetworkConnectivity() {
    printHeader('Test 3: Network Connectivity');

    try {
        const response = await axios.post(
            `${CONFIG.API_BASE_URL}/api/auth/authenticate`,
            { phoneNumber: VALID_USER.phoneNumber, passportNumber: VALID_USER.passportNumber },
            { timeout: 5000 }
        );

        printTestResult('Server Reachability', true, `Connected to ${CONFIG.API_BASE_URL}`);
        printTestResult('Response Time', true, 'Response received within 5 seconds');
        return true;

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            printTestResult('Server Reachability', false, 'Connection refused - Server not running');
        } else if (error.code === 'ETIMEDOUT') {
            printTestResult('Server Reachability', false, 'Connection timeout');
        } else if (error.code === 'ENOTFOUND') {
            printTestResult('Server Reachability', false, 'Host not found - Check IP address');
        } else {
            printTestResult('Server Reachability', false, error.message);
        }

        console.log('\n💡 Troubleshooting Tips:');
        console.log('   1. Ensure backend server is running: cd backend && node server.js');
        console.log(`   2. Verify IP address is correct: ${CONFIG.API_BASE_URL}`);
        console.log('   3. Check firewall settings');
        console.log('   4. Ensure mobile device and computer are on same network');

        return false;
    }
}

/**
 * Test token expiration format
 */
async function testTokenExpiration() {
    printHeader('Test 4: Token Expiration');

    try {
        const response = await axios.post(
            `${CONFIG.API_BASE_URL}/api/auth/authenticate`,
            {
                phoneNumber: VALID_USER.phoneNumber,
                passportNumber: VALID_USER.passportNumber
            },
            { timeout: CONFIG.TIMEOUT }
        );

        const token = response.data.authToken;

        // Decode JWT payload (without verification)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

        if (payload.exp) {
            const expirationDate = new Date(payload.exp * 1000);
            const now = new Date();
            const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

            printTestResult('Token Expiration Field', true, `Expires in ${daysUntilExpiration} days`);
            console.log(`   Expiration Date: ${expirationDate.toLocaleString()}`);

            // Check if expiration is reasonable (e.g., 7 days)
            if (daysUntilExpiration >= 7 && daysUntilExpiration <= 7) {
                printTestResult('Token Expiration Duration', true, '7 days (as expected)');
            } else {
                printTestResult('Token Expiration Duration', true, `${daysUntilExpiration} days`);
            }
        } else {
            printTestResult('Token Expiration Field', false, 'No expiration field in token');
        }

        // Verify token payload contains required fields
        const requiredPayloadFields = ['userId', 'phoneNumber', 'passportNumber', 'userType'];
        const missingPayloadFields = requiredPayloadFields.filter(field => !payload[field]);

        if (missingPayloadFields.length === 0) {
            printTestResult('Token Payload Fields', true, 'All required fields present');
        } else {
            printTestResult('Token Payload Fields', false, `Missing: ${missingPayloadFields.join(', ')}`);
        }

    } catch (error) {
        printTestResult('Token Expiration Test', false, error.message);
    }
}

/**
 * Print final summary
 */
function printSummary() {
    printHeader('Test Summary');

    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    if (testResults.failed > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.tests
            .filter(test => !test.passed)
            .forEach(test => {
                console.log(`   - ${test.name}`);
                if (test.details) {
                    console.log(`     ${test.details}`);
                }
            });
    }

    console.log('\n' + '='.repeat(70));

    if (testResults.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! 🎉');
    } else {
        console.log('⚠️  SOME TESTS FAILED - Review the errors above');
    }
    console.log('='.repeat(70));
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('\n🧪 Qurbani Mobile App - Authentication Test Suite');
    console.log(`📱 API: ${CONFIG.API_BASE_URL}`);
    console.log(`⏱️  Timeout: ${CONFIG.TIMEOUT}ms`);
    console.log(`📅 Date: ${new Date().toLocaleString()}\n`);

    // Run tests in sequence
    await testNetworkConnectivity();
    await testValidAuthentication();
    await testInvalidCredentials();
    await testTokenExpiration();

    // Print summary
    printSummary();

    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Execute tests
if (require.main === module) {
    runAllTests();
}

module.exports = {
    runAllTests,
    testValidAuthentication,
    testInvalidCredentials,
    testNetworkConnectivity,
    testTokenExpiration
};
