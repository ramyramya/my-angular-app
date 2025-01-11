/*const CryptoJS = require('crypto-js');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY; // Make sure to set this in your .env file

const encryptionMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    if (typeof body === 'object') {
      body = JSON.stringify(body);
    }

    const encrypted = CryptoJS.AES.encrypt(body, secretKey).toString();
    originalSend.call(this, encrypted);
    

  };

  next();
};

module.exports = encryptionMiddleware;
*/

const CryptoJS = require('crypto-js');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY; // Make sure to set this in your .env file

const encryptionMiddleware = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    // If the body is an object, convert it to a JSON string
    if (typeof body === 'object') {
      body = JSON.stringify(body);
    }

    // Encrypt the stringified body
    const encrypted = CryptoJS.AES.encrypt(body, secretKey).toString();

    // Send the encrypted data as JSON (make sure the correct format is used)
    res.setHeader('Content-Type', 'application/json'); // Sending as application/json
    originalSend.call(this, JSON.stringify({ encrypted: encrypted }));
  };

  // Proceed to the next middleware
  next();
};

module.exports = encryptionMiddleware;
