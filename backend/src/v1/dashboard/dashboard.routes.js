/*const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../middleware/authMiddleware');

router.get('/user-info', authMiddleware, dashboardController.getUserInfo);



module.exports = router;*/

const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const dashboardService = require('./dashboard.service');
const authMiddleware = require('../../middleware/authMiddleware');

// Route to get user info
router.get('/user-info', authMiddleware, dashboardController.getUserInfo);

// Route to get presigned URL for uploading profile photo
router.post('/get-presigned-url', authMiddleware, dashboardController.getPresignedUrl);
router.post('/update-profile-pic', authMiddleware, dashboardController.updateProfilePic);
router.get('/vendorCount', authMiddleware, dashboardController.getVendorCount);
router.get('/products', authMiddleware, dashboardController.getProducts);
router.get('/categories', authMiddleware, dashboardController.getCategories);
router.get('/vendors', authMiddleware, dashboardController.getVendors);
router.post('/add-product',authMiddleware, dashboardController.addProduct);
router.post('/move-to-cart',authMiddleware, dashboardController.moveToCart);
// Fetch all cart items for the logged-in user
router.get('/cart', authMiddleware, dashboardController.getCartItems);
router.put('/cart/update', authMiddleware, dashboardController.updateCartItemQuantity);
router.put('/delete_product/:productId', authMiddleware, dashboardController.deleteProductAndVendors);
router.put('/products/:product_id', authMiddleware, dashboardController.updateProductAndVendors);
router.delete('/delete-cart-item/:cartId', authMiddleware, dashboardController.deleteCartItem);
router.post('/update-products', authMiddleware, dashboardController.updateProducts);
router.post('/get-presigned-url-for-file', authMiddleware, dashboardController.getPresignedUrlForFile);
router.get('/get-user-files', authMiddleware, dashboardController.getUserFiles);
router.get('/users', authMiddleware, dashboardController.getUsers);
//router.get('/messages/:userId', authMiddleware, dashboardController.getMessages);
router.get("/active-users", dashboardController.getActiveUsers);

router.get('/imported-files', authMiddleware, dashboardController.getImportedFiles);
router.post('/get-presigned-url-for-import-file', authMiddleware, dashboardController.getPresignedUrlForImportFile);
router.post('/save-imported-file-details', authMiddleware, dashboardController.saveImportedFileDetails);

router.post('/process-files', authMiddleware, dashboardService.processImportedFile);
router.get('/getNotifications', authMiddleware, dashboardController.getNotifications);
router.post('/notifications/markAsRead', authMiddleware, dashboardController.markAsRead);
module.exports = router;

