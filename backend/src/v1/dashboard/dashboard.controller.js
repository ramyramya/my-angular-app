const dashboardService = require('./dashboard.service');

async function getUserInfo(req, res) {
  try {
    const userId = req.user.userId; // Extracted from the token via authMiddleware
    const userInfo = await dashboardService.fetchUserInfo(userId);

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, username: userInfo.username, thumbnail: userInfo.thumbnail });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = { getUserInfo };
