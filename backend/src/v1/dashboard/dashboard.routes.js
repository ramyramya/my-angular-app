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


module.exports = router;

