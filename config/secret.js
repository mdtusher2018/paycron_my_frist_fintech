// config/secret.js
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  BASE_URL: process.env.BASE_URL,
  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',

  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  // Access Token
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',

  // Refresh Token
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || sk_test_51RINl1PG9XHOcPc0A63wqt8ypnLshYffLGY5RHuJODMoFqPxHHGoc3iUGFAPhbLFYTfukYTMbxneRmsLnfOXZIu900N4Umf2qD


};
