// filepath: /src/v1/routes.js
const express = require('express');
const authRoutes = require('./auth/auth.routes');

const router = express.Router();

router.use('/auth', authRoutes);

module.exports = router;
