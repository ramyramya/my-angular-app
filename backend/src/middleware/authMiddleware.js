// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// function authMiddleware(req, res, next) {
//   console.log("AuthMiddleware triggered for: ", req.path);
//   const token = req.headers['authorization'];

//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     console.log(req.user); // Attach decoded user info to the request
//     next();
//   } catch (error) {
//     console.error('Invalid token:', error);
//     res.status(401).json({ success: false, message: 'Access Denied: Invalid Token' });
//   }
// }


const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  console.log("AuthMiddleware triggered for: ", req.path);
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to the request
    //console.log("Decoded User: ", req.user);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Token is expired, forward a custom error to the next middleware
      console.warn('Token expired:', error);
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Token Expired',
        isExpired: true, // Custom flag for the frontend to handle
      });
    } else {
      console.error('Invalid token:', error);
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Invalid Token',
        isExpired:false,
      });
    }
  }
}




module.exports = authMiddleware;
