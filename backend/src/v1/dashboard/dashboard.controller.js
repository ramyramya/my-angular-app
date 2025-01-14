/*const dashboardService = require('./dashboard.service');

const fs = require('fs');
const CryptoJS = require('crypto-js');

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



module.exports = { getUserInfo};
*/


const AWS = require('aws-sdk');
const CryptoJS = require('crypto-js');
const dashboardService = require('./dashboard.service');
const knex = require('../../mysql/knex')

// Set up AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function getUserInfo(req, res) {
  try {
    const userId = req.user.userId; // Extracted from the token via authMiddleware
    const userInfo = await dashboardService.fetchUserInfo(userId);

    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, userId: userId, username: userInfo.username, thumbnail: userInfo.thumbnail, email: userInfo.email });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// Endpoint to get the presigned URL for uploading a profile photo
async function getPresignedUrl(req, res) {
  try {
    const { payload } = req.body;

    // Decrypt the incoming payload
    const secretKey = process.env.SECRET_KEY;
    const decryptedData = CryptoJS.AES.decrypt(payload, secretKey).toString(CryptoJS.enc.Utf8);
    console.log(decryptedData);
    const { fileName, fileType } = JSON.parse(decryptedData);

    // Ensure the required fields are present
    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, message: 'Missing fileName or fileType' });
    }

    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `profile-photos/${fileName}`,
      Expires: 60 * 50, // URL expiration time in seconds
      ContentType: fileType,
      //ACL: 'public-read' // Make the file publicly accessible
    };

    const presignedUrl = await s3.getSignedUrlPromise('putObject', s3Params);

    res.json({
      success: true,
      presignedUrl,
      fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profile-photos/${fileName}`
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ success: false, message: 'Error generating presigned URL' });
  }
}

async function updateProfilePic(req, res) {
  try {
    const userId = req.user.userId; // Extracted from token or session
    console.log("userId: ", userId);

    // Decrypt the incoming encrypted payload
    const secretKey = process.env.SECRET_KEY;  // Make sure your secret key is in .env
    const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);
    console.log(decryptedData);

    // Parse the decrypted data to get the file URL
    const { fileUrl } = JSON.parse(decryptedData);

    // Ensure the fileUrl is valid
    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'File URL is missing' });
    }

    // Update the user's profile picture URL in the database
    const updatedUser = await knex('users')  // Assuming your users table is named 'users'
      .where('id', userId)  // Assuming the user's ID is in the 'id' field
      .update({ thumbnail: fileUrl });

    console.log("updated user: ", updatedUser);

    if (updatedUser > 0) {
      return res.json({ success: true, message: 'Profile picture updated successfully', user: updatedUser[0] });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating profile pic:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// Endpoint to get the vendor count
async function getVendorCount(req, res) {
  try {
    const count = await dashboardService.getVendorCount();
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching vendor count:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

async function getProducts(req, res) {
  try {
    const { page = 1, limit = 5 } = req.query;
    const data = await dashboardService.getProducts(Number(page), Number(limit));
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
// Get categories
async function getCategories(req, res) {
  try {
    const categories = await dashboardService.getCategories();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

// Get vendors
async function getVendors(req, res) {
  try {
    //const userId = req.user.userId;
    const vendors = await dashboardService.getVendors();
    res.json({ success: true, vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

/*async function addProduct(req, res) {
  try {
    // Decrypt the incoming encrypted payload
    const secretKey = process.env.SECRET_KEY;  // Make sure your secret key is in .env
    const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);
    console.log(decryptedData);
    const { productName, category, vendor, quantity, unitPrice, unit, status, productImage } = decryptedData;

    // Validate the required fields (example: name, price)
    if (!productName || !category || !vendor || quantity <= 0 || !unit || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Prepare the product data for insertion
    const newProduct = {
      productName,
      category,
      vendor,
      quantity,
      unitPrice,
      unit,
      productImage,
      status,
      created_at: new Date(),  // Assuming you want to add timestamps
      updated_at: new Date(),
    };

    // Add the product using the service (assuming addProduct returns the inserted product data)
    const addedProduct = await dashboardService.addProduct(newProduct);
    console.log("Hello Hii");

    if (addedProduct) {
      console.log("Added product: ", addedProduct);;
      res.json({ success: true, message: 'Product added successfully', product: addedProduct });
    } else {
      res.status(500).json({ success: false, message: 'Failed to add product' });
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}*/


async function addProduct(req, res) {
  try {
    const secretKey = process.env.SECRET_KEY;
    const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);
    console.log('Decrypted Data:', decryptedData);

    // Try to parse decrypted data to JSON
    let parsedData;
    try {
      parsedData = JSON.parse(decryptedData);
      console.log('Parsed Data:', parsedData);
    } catch (error) {
      console.error('Failed to parse decrypted data:', error);
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }

    const { productName, category, vendor, quantity, unitPrice, unit, status, productImage } = parsedData;

    // Validate required fields
    if (!productName || !category || !vendor || quantity <= 0 || !unit || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newProduct = {
      productName,
      category,
      vendor,
      quantity,
      unitPrice,
      unit,
      productImage,
      status,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const addedProduct = await dashboardService.addProduct(newProduct);
    console.log("Product added:", addedProduct);

    if (addedProduct) {
      res.json({ success: true, message: 'Product added successfully', product: addedProduct });
    } else {
      res.status(500).json({ success: false, message: 'Failed to add product' });
    }
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}


async function moveToCart(req, res) {
  const secretKey = process.env.SECRET_KEY;
  const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);
  parsedData = JSON.parse(decryptedData);
  console.log('Decrypted Data:', parsedData);
  const  products  = parsedData.products;
  console.log("products: ", products);

  try {
    await dashboardService.moveToCart(products);
    res.status(200).json({ message: 'Products moved to cart successfully.' });
  } catch (error) {
    console.error('Error moving products to cart:', error);
    res.status(500).json({ error: 'Failed to move products to cart.' });
  }
};


// Get all cart items for a specific user
async function getCartItems(req, res){
  const userId = req.user.userId; // Assuming the user ID is available from authentication middleware

  try {
    // Fetch cart items along with related product, category, and vendor information
    const cartItems = await dashboardService.getCartItems(userId);
    console.log("Cart Items: ", cartItems);
    res.status(200).json({ message: 'Fetched cart products', cartItems });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return res.status(500).json({ error: 'Failed to fetch cart items' });
  }
};


// Update quantities in the cart and product stock with transaction for multiple products
async function updateCartItemQuantity(req, res) {
  const secretKey = process.env.SECRET_KEY;
  const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);
  const parsedData = JSON.parse(decryptedData);
  console.log('Decrypted Data:', parsedData);

  try {
    const userId = req.user.userId;

    // Iterate over the array of products and update each one
    const updateResults = await Promise.all(
      parsedData.map(async ({ productId, changeInQuantity }) => {
        return await dashboardService.updateCartItemQuantity(productId, changeInQuantity, userId);
      })
    );

    // Check for errors in the results
    const errors = updateResults.filter((result) => !result.success);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Some updates failed', details: errors });
    }

    return res.status(200).json({ message: 'Cart and product updated successfully' });
  } catch (error) {
    console.error('Error in updating cart items and products:', error);
    return res.status(500).json({ error: 'Failed to update cart items and products' });
  }
}


module.exports = {
  getUserInfo,
  getPresignedUrl,
  updateProfilePic,
  getVendorCount,
  getProducts,
  getCategories,
  getVendors,
  addProduct,
  moveToCart,
  getCartItems,
  updateCartItemQuantity
};




