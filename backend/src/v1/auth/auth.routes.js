// filepath: /src/v1/auth/auth.routes.js
const express = require('express');
const { signup, login, refresh, forgotPassword, resetPassword } = require('./auth.controller');


const router = express.Router();

router.post('/signup',signup);

router.post('/login', login);

router.post('/refresh', refresh);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

module.exports = router;