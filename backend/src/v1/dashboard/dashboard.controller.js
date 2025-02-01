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

// async function getProducts(req, res) {
//   try {
//     const { page = 1, limit = 5 } = req.query;
//     const data = await dashboardService.getProducts(Number(page), Number(limit));
//     res.json({ success: true, ...data });
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// }


async function getProducts(req, res) {
  try {
    const { page = 1, limit = 5, searchTerm = '' } = req.query;

    // Determine filters from request
    const filters = {};
    if (req.query.filterByProductName === 'true') filters.productName = searchTerm;
    if (req.query.filterByStatus === 'true') filters.status = searchTerm;
    if (req.query.filterByCategory === 'true') filters.category = searchTerm;
    if (req.query.filterByVendor === 'true') filters.vendor = searchTerm;

    const data = await dashboardService.getProducts(Number(page), Number(limit), filters);
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


// async function addProduct(req, res) {
//   try {
//     const secretKey = process.env.SECRET_KEY;
//     const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);
//     console.log('Decrypted Data:', decryptedData);

//     // Try to parse decrypted data to JSON
//     let parsedData;
//     try {
//       parsedData = JSON.parse(decryptedData);
//       console.log('Parsed Data:', parsedData);
//     } catch (error) {
//       console.error('Failed to parse decrypted data:', error);
//       return res.status(400).json({ success: false, message: 'Invalid data format' });
//     }

//     const { productName, category, vendor, quantity, unitPrice, unit, status, productImage } = parsedData;

//     // Validate required fields
//     if (!productName || !category || !vendor || quantity <= 0 || !unit || !status) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     const newProduct = {
//       productName,
//       category,
//       vendor,
//       quantity,
//       unitPrice,
//       unit,
//       productImage,
//       status,
//       created_at: new Date(),
//       updated_at: new Date(),
//     };

//     const addedProduct = await dashboardService.addProduct(newProduct);
//     console.log("Product added:", addedProduct);

//     if (addedProduct) {
//       res.json({ success: true, message: 'Product added successfully', product: addedProduct });
//     } else {
//       res.status(500).json({ success: false, message: 'Failed to add product' });
//     }
//   } catch (error) {
//     console.error('Error adding product:', error);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// }

async function addProduct(req, res) {
  try {
    const secretKey = process.env.SECRET_KEY;
    const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);

    let parsedData;
    try {
      parsedData = JSON.parse(decryptedData);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }

    const { productName, category, vendors, quantity, unitPrice, unit, status, productImage } = parsedData;

    // Validate required fields
    if (!productName || !category || !vendors || vendors.length === 0 || quantity <= 0 || !unit || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newProduct = {
      productName,
      category,
      quantity,
      unitPrice,
      unit,
      productImage,
      status,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const addedProduct = await dashboardService.addProduct(newProduct, vendors);
    if (addedProduct) {
      res.json({ success: true, message: 'Product added successfully', product: addedProduct });
    } else {
      res.status(500).json({ success: false, message: 'Failed to add product' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}



async function moveToCart(req, res) {
  const secretKey = process.env.SECRET_KEY;
  const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);
  parsedData = JSON.parse(decryptedData);
  console.log('Decrypted Data:', parsedData);
  const products = parsedData.products;
  console.log("products: ", products);

  try {
    await dashboardService.moveToCart(products);
    res.status(200).json({ message: 'Products moved to cart successfully.' });
  } catch (error) {
    console.error('Error moving products to cart:', error);
    res.status(500).json({ error: 'Failed to move products to cart.' });
  }
};


// // Get all cart items for a specific user
// async function getCartItems(req, res){
//   const userId = req.user.userId; // Assuming the user ID is available from authentication middleware

//   try {
//     // Fetch cart items along with related product, category, and vendor information
//     const cartItems = await dashboardService.getCartItems(userId);
//     console.log("Cart Items: ", cartItems);
//     res.status(200).json({ message: 'Fetched cart products', cartItems });
//   } catch (error) {
//     console.error('Error fetching cart items:', error);
//     return res.status(500).json({ error: 'Failed to fetch cart items' });
//   }
// };


// async function getCartItems(req, res) {
//   try {
//     const { page = 1, limit = 5 } = req.query;
//     const userId = req.user.userId;
//     const data = await dashboardService.getCartItems(userId, Number(page), Number(limit));
//     res.json({ success: true, ...data });
//   } catch (error) {
//     console.error('Error fetching cartProducts:', error);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// }

async function getCartItems(req, res) {
  try {
    const { page = 1, limit = 5, searchTerm = '', filterByProductName = false, filterByStatus = false, filterByCategory = false, filterByVendor = false } = req.query;
    const userId = req.user.userId;

    // Prepare filter params object to pass to the service
    const filters = {
      searchTerm,
      filterByProductName,
      filterByStatus,
      filterByCategory,
      filterByVendor
    };

    const data = await dashboardService.getCartItems(userId, Number(page), Number(limit), filters);
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}



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


async function deleteProductAndVendors(req, res) {
  console.log("Params in Function: ", req.params);
  const { productId } = req.params;

  try {
    // Call the service method to delete the product and update vendor status
    await dashboardService.deleteProductAndVendors(productId);

    // Send a success response
    res.status(200).send({ message: 'Product and related vendor status updated successfully' });
  } catch (error) {
    console.error('Error in controller:', error);
    res.status(500).send({ message: 'Error deleting product' });
  }
}

async function updateProductAndVendors(req, res) {

  const secretKey = process.env.SECRET_KEY;
  const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);
  const parsedData = JSON.parse(decryptedData);
  console.log('Decrypted Data:', parsedData);
  const productData = parsedData;
  const { product_id } = req.params;

  if (!productData || !product_id) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    // Call the service function to update product and vendor association
    const result = await dashboardService.updateProductAndVendors(product_id, productData);

    if (result.success) {
      return res.status(200).json({ success: true, message: 'Product updated successfully!' });
    } else {
      return res.status(500).json({ success: false, message: 'Error updating product' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function deleteCartItem(req, res) {
  const { cartId } = req.params;
  console.log("cartId: ", cartId);

  try {
    await dashboardService.deleteCartItem(cartId);
    res.status(200).json({ message: 'Cart item deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ message: 'Failed to delete cart item' });
  }
}


async function updateProducts(req, res) {
  try {
    const secretKey = process.env.SECRET_KEY;
    const decryptedData = CryptoJS.AES.decrypt(req.body.payload, secretKey).toString(CryptoJS.enc.Utf8);
    const parsedData = JSON.parse(decryptedData);
    console.log('Decrypted Data:', parsedData);
    const { data } = parsedData;
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'Invalid data!' });
    }

    await dashboardService.updateProductDetails(data);
    res.status(200).json({ message: 'Products updated successfully!' });
  } catch (error) {
    console.error('Error updating products:', error);
    res.status(500).json({ message: 'Failed to update products!', error });
  }

}

// Endpoint to get the presigned URL for uploading a file
async function getPresignedUrlForFile(req, res) {
  try {
    const { payload } = req.body;

    // Decrypt the incoming payload
    const secretKey = process.env.SECRET_KEY;
    const decryptedData = CryptoJS.AES.decrypt(payload, secretKey).toString(CryptoJS.enc.Utf8);
    console.log(decryptedData);
    const { fileName, fileType } = JSON.parse(decryptedData);
    const { userName, userId } = req.user;
    

    const filePath = `${userName}_${userId}/${fileName}`;
    // Ensure the required fields are present
    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, message: 'Missing fileName or fileType' });
    }

    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filePath,
      Expires: 60 * 50, // URL expiration time in seconds
      ContentType: fileType,
      //ACL: 'public-read' // Make the file publicly accessible
    };

    const presignedUrl = await s3.getSignedUrlPromise('putObject', s3Params);
    
    
    res.json({
      success: true,
      presignedUrl,
      fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filePath}`
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ success: false, message: 'Error generating presigned URL' });
  }
}



async function getUserFiles(req, res){
  const { userName, userId } = req.user;
  const prefix = `${userName}_${userId}/`; // Folder structure in S3

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Prefix: prefix,
  };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error('Error retrieving files:', err);
      return res.status(500).json({ error: 'Error retrieving files from S3' });
    }

  

    const files = data.Contents.map((file) => ({
      
      key: file.Key,
      url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
      type: file.ContentType || 'unknown', // ContentType from S3 object if available
    }));

    res.json({ files });
  });
}

async function getUsers(req, res) {
  try {
    const users = await dashboardService.fetchAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}


// async function getMessages(req, res) {
//   try {
//     const userId = req.params.userId;
//     const messages = await dashboardService.fetchMessages(userId);
//     res.json(messages);
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// }


async function getActiveUsers(req, res) {
  try {
    const users = await dashboardService.getActiveUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active users" });
  }
}

async function getImportedFiles(req, res) {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 5, search = '' } = req.query; // Default: page 1, 5 items per page
    //console.log("search: ", search);

    const offset = (page - 1) * limit;

    // Query files with search and pagination
    let query = knex('imported_files')
      .where({ user_id: userId })
      .andWhere((qb) => {
        if (search) {
          qb.whereRaw("SUBSTRING_INDEX(file_key, '/', -1) LIKE ?", [`%${search}%`])
            .orWhere('status', 'like', `%${search}%`);
        }
      })
      .orderBy('id', 'desc');

    // Get total count (for pagination)
    const totalFiles = await query.clone().count('* as count').first();
    const total = totalFiles.count;

    // Fetch paginated results
    const files = await query.limit(limit).offset(offset);
    //console.log("files: ", files);

    res.json({
      success: true,
      files,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching imported files:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}


async function getPresignedUrlForImportFile(req, res) {
  try {
    const { payload } = req.body;

    // Decrypt the incoming payload
    const secretKey = process.env.SECRET_KEY;
    const decryptedData = CryptoJS.AES.decrypt(payload, secretKey).toString(CryptoJS.enc.Utf8);
    console.log(decryptedData);
    const { fileName, fileType } = JSON.parse(decryptedData);
    const { userName, userId } = req.user;
    

    const filePath = `imports/${userName}/${userId}/${fileName}`;
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filePath,
      Expires: 60 * 50,
      ContentType: fileType,
    };
    const presignedUrl = await s3.getSignedUrlPromise('putObject', s3Params);

    res.json({
      success: true,
      presignedUrl,
      fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filePath}`
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ success: false, message: 'Error generating presigned URL' });
  }
}


async function saveImportedFileDetails(req, res) {
  try {
    const { payload } = req.body;

    // Decrypt the incoming payload
    const secretKey = process.env.SECRET_KEY;
    const decryptedData = CryptoJS.AES.decrypt(payload, secretKey).toString(CryptoJS.enc.Utf8);
    console.log(decryptedData);
    
    const { fileUrl, username, userId } = JSON.parse(decryptedData);

    await knex('imported_files').insert({
      file_key: fileUrl,
      username,
      user_id: userId,
      status: 'pending',
    });

    res.json({ success: true, message: 'File details saved successfully' });
  } catch (error) {
    console.error('Error saving file details:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

async function getNotifications(req, res){
  const userId = req.user.userId;
  try {
    const notifications = await knex('notifications')
      .where('user_id', userId)
      .andWhere('status', 'unread')
      .orderBy('created_at', 'desc');

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


async function markAsRead(req, res){
  const userId = req.user.userId;
  try {
    await knex('notifications')
      .where('user_id', userId)
      .andWhere('status', 'unread')
      .update({ status: 'read' });

    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
  updateCartItemQuantity,
  deleteProductAndVendors,
  updateProductAndVendors,
  deleteCartItem,
  updateProducts,
  getPresignedUrlForFile,
  getUserFiles,
  getUsers,
  //getMessages,
  getActiveUsers,
  getImportedFiles,
  getPresignedUrlForImportFile,
  saveImportedFileDetails,
  getNotifications,
  markAsRead,
};




