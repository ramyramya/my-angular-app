/*const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/user-info', authMiddleware, dashboardController.getUserInfo);



module.exports = router;*/

const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../middleware/authMiddleware');

// Route to get user info
router.get('/user-info', authMiddleware, dashboardController.getUserInfo);

// Route to get presigned URL for uploading profile photo
router.post('/get-presigned-url', authMiddleware, dashboardController.getPresignedUrl);

module.exports = router;

