// filepath: /src/v1/auth/auth.routes.js
const express = require('express');
const { signup, login, refresh } = require('./auth.controller');


const router = express.Router();

router.post('/signup',signup);

router.post('/login', login);

router.post('/refresh', refresh);

module.exports = router;