// filepath: /src/v1/auth/auth.controller.js
const User = require('../../models/User');
const userSchema = require('../../middleware/validators/userValidator');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt')
require('dotenv').config();
const knex = require('../../mysql/knex');
const jwt = require('jsonwebtoken');


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


    /*const user = await User.query().insert({
      ...userData,
      username,
      password: hashedPassword
    });*/
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
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if the password is valid
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate access token and refresh token
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with the tokens
    res.json({
      success: true,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = { signup, login };