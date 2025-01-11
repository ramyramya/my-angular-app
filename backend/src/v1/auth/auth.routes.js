// filepath: /src/v1/auth/auth.routes.js
const express = require('express');
const { signup, login } = require('./auth.controller');


const router = express.Router();

router.post('/signup',signup);

router.post('/login', login);

module.exports = router;