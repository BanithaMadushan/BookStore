const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const envVars = envFile.split('\n');

// Set environment variables
envVars.forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  }
});

// Print env vars
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE);
console.log('GOOGLE_BOOKS_API_KEY:', process.env.GOOGLE_BOOKS_API_KEY); 