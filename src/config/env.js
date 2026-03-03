// Environment configuration
// TODO: Create .env file and add your backend API URL

// For development, you can hardcode the URL here
// For production, use environment variables

const ENV = {
    dev: {
        apiUrl: 'http://localhost:3000/api', // Change to your backend URL
    },
    prod: {
        apiUrl: 'https://your-production-api.com/api', // Change to your production API URL
    },
};

const getEnvVars = () => {
    if (__DEV__) {
        return ENV.dev;
    }
    return ENV.prod;
};

export default getEnvVars;
