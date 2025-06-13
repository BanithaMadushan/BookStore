const dotenv = require('dotenv');
const path = require('path');

// Load env vars with explicit path
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Print env vars
console.log('Path to .env:', path.resolve(__dirname, '.env'));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE);
console.log('GOOGLE_BOOKS_API_KEY:', process.env.GOOGLE_BOOKS_API_KEY); 