const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/user-info', authMiddleware, dashboardController.getUserInfo);

module.exports = router;
