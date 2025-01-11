const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(req.user); // Attach decoded user info to the request
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    res.status(401).json({ success: false, message: 'Access Denied: Invalid Token' });
  }
}

module.exports = authMiddleware;
