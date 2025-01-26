
const User = require('../../models/User');
const userSchema = require('../../middleware/validators/userValidator');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt')
require('dotenv').config();
const knex = require('../../mysql/knex');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


async function signup(req, res) {
  try {
    const { payload } = req.body;
    //console.log(payload);
    const secretKey = process.env.SECRET_KEY;
    const decryptedData = CryptoJS.AES.decrypt(payload, secretKey).toString(CryptoJS.enc.Utf8);
    const userData = JSON.parse(decryptedData);
    //console.log(userData);

    const { error } = userSchema.validate(userData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Generate username
    const username = `${userData.firstname.toLowerCase()}.${userData.lastname.toLowerCase()}`;
    console.log(username);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    // Insert user into the database using Knex
    const [userId] = await knex('users').insert({
      ...userData,
      username,
      password: hashedPassword
    }) // Returning the user ID after insertion

    console.log(userId);
    res.status(201).json({success: true, message: 'User registered successfully' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function login(req, res) {
  try {
    // Decrypt the payload from the request body
    const { payload } = req.body;
    const secretKey = process.env.SECRET_KEY;
    const decryptedData = CryptoJS.AES.decrypt(payload, secretKey).toString(CryptoJS.enc.Utf8);
    const loginData = JSON.parse(decryptedData);

    // Extract email/username and password from decrypted data
    const { emailOrUsername, password } = loginData;

    // Validate the decrypted fields
    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, message: 'Missing email/username or password' });
    }

    // Query the database for the user with the provided email or username
    const user = await knex('users')
      .where('email', emailOrUsername)
      .orWhere('username', emailOrUsername)
      .first();

    if (!user) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    // Check if the password is valid
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    // Generate access token and refresh token
    const accessToken = jwt.sign({ userId: user.id, userName: user.username }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const refreshToken = jwt.sign({ userId: user.id, userName: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });


    // Save the refresh token in the database
    await knex('users')
      .where('id', user.id)
      .update({ refreshToken });
    // Respond with the tokens
    res.json({
      success: true,

      userId: user.id,
      accessToken,
      //refreshToken
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}


// async function refresh(req, res){
//   // Decrypt the payload from the request body
//   console.log("Entered refresh Function");
//   const { payload } = req.body;
//   const secretKey = process.env.SECRET_KEY;
//   const decryptedData = CryptoJS.AES.decrypt(payload, secretKey).toString(CryptoJS.enc.Utf8);
//   const refreshData = JSON.parse(decryptedData);
//   console.log("Refresh Data: ", refreshData);
//   const { refreshToken } = refreshData;

//   if (!refreshToken) {
//     return res.status(400).json({ message: 'Refresh token required' });
//   }

//   try {
//     // Verify refresh token
//     const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
//     // Find the user (ensure the refresh token matches the user)
//     const user = await knex('users')
//                   .where('id', decoded.userId)
//                   .first();
//     console.log("User found in refresh token process");
//     //console.log("User: ", user);
//     if (!user) {
//       return res.status(401).json({ message: 'User not found' ,  isRefreshValid: false});
//     }

//     // Generate new access token
//     const newAccessToken = jwt.sign({ userId: user.id, userName: user.username }, process.env.JWT_SECRET, { expiresIn: '10m' });
//     console.log("new token: ", newAccessToken);

//     res.json({ accessToken: newAccessToken, refreshToken: refreshToken });
//   } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//         return res.status(401).json({ error: 'Refresh token expired' , isRefreshValid: false});
//     }
//     return res.status(401).json({ error: 'Invalid refresh token' ,  isRefreshValid: false});
// }
// };

async function refresh(req, res) {
  console.log("Entered refresh Function");

  // Get the userId from the request parameters (or from the body if passed differently)
  const { userId } = req.params;
  console.log("User ID: ", userId);

  if (!userId) {
    return res.status(400).json({ message: 'User ID required' });
  }

  try {
    // Query the database to get the user's stored refresh token
    const user = await knex('users')
      .where('id', userId)
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User not found', isRefreshValid: false });
    }

    const refreshToken = user.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token not found for user', isRefreshValid: false });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    console.log("Refresh token decoded: ", decoded);

    // Generate new access token
    const newAccessToken = jwt.sign({ userId: decoded.userId, userName: decoded.userName }, process.env.JWT_SECRET, { expiresIn: '10m' });
    console.log("New access token: ", newAccessToken);

    // Send the new access token and the refresh token
    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token expired', isRefreshValid: false });
    }
    return res.status(401).json({ error: 'Invalid refresh token', isRefreshValid: false });
  }
}

async function forgotPassword(req, res){

  // Decrypt the payload from the request body
  const { payload } = req.body;
  const secretKey = process.env.SECRET_KEY;
  const decryptedData = CryptoJS.AES.decrypt(payload, secretKey).toString(CryptoJS.enc.Utf8);
  const parsedData = JSON.parse(decryptedData);
  const { email } = parsedData;

  try {
    // Check if the email exists
    const user = await knex('users').where({ email }).first();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token using crypto-js
    const token = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1-hour expiry

    
    // Update the user with the reset token and expiry
    await knex('users')
      .where({ email })
      .update({
        resetToken: token,
        resetTokenExpiry,
      });

    // Configure SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    await transporter.sendMail({
      from: 'ramyasenapati2004@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>This link is valid for 1 hour.</p>`,
    });

    res.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
}


async function resetPassword(req, res){

  // Decrypt the payload from the request body
  const { payload } = req.body;
  const secretKey = process.env.SECRET_KEY;
  const decryptedData = CryptoJS.AES.decrypt(payload, secretKey).toString(CryptoJS.enc.Utf8);
  const parsedData = JSON.parse(decryptedData);
  const { token, newPassword } = parsedData;

  try {
    // Find the user with the matching reset token
    const user = await knex('users').where({ resetToken: token }).first();

    // Check if token is valid and has not expired
    if (!user || new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    await knex('users')
      .where({ resetToken: token })
      .update({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
}

module.exports = { signup, login, refresh, forgotPassword, resetPassword };