// filepath: /src/v1/auth/auth.controller.js
const User = require('../../models/User');
const userSchema = require('../../middleware/validators/userValidator');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt')
require('dotenv').config();

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


    const user = await User.query().insert({
      ...userData,
      username,
      password: hashedPassword
    });

    res.status(201).json({success: true, message: 'User registered successfully' });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { signup };