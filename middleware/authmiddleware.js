const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const { JWT_SECRET } = require('../config/secret');


exports.authrized = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};



exports.adminOnly = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    // console.log(JWT_SECRET);
    
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    next();
  } catch (err) {
    console.error('adminOnly error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};


exports.userOnly = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'user') {
      return res.status(403).json({ message: 'Access denied. Users can only access.' });
    }

    // Optionally attach decoded user info to req
    req.user = decoded;

    next();
  } catch (err) {
    console.error('userOnly error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};



