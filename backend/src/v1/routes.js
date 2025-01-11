// filepath: /src/v1/routes.js
const express = require('express');
const authRoutes = require('./auth/auth.routes');
const dashboardRoutes = require('../v1/dashboard/dashboard.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);


module.exports = router;
