// filepath: /src/v1/auth/auth.routes.js
const express = require('express');
const { signup } = require('./auth.controller');


const router = express.Router();

router.post('/signup',signup);

module.exports = router;