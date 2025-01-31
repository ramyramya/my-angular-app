const knex = require('../../mysql/knex');
const AWS = require('aws-sdk');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


async function fetchUserInfo(userId) {
  try {
    const user = await knex('users')
      .select('username', 'thumbnail', 'email')
      .where({ id: userId })
      .first();

    return user;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
}


// Get the count of vendors
async function getVendorCount() {
  try {
    const result = await knex('vendors').count('* as count').first();
    return result.count;  // Return the count of vendors
  } catch (error) {
    console.error('Error fetching vendor count:', error);
    throw error;
  }
}




// async function getProducts(page = 1, limit = 5) {
//   try {
//     const offset = (page - 1) * limit;

//     // Fetch the main product data
//     const products = await knex('products')
//       .select(
//         'products.product_id',
//         'products.product_name',
//         'products.status AS product_status',
//         'categories.category_id',
//         'categories.category_name',
//         'categories.status AS category_status',
//         'products.quantity_in_stock',
//         'products.unit_price',
//         'products.product_image',
//         'products.unit'
//       )
//       .join('categories', 'products.category_id', '=', 'categories.category_id')
//       .where('products.status', 1)
//       .andWhere('categories.status', 1)
//       .groupBy(
//         'products.product_id',
//         'products.product_name',
//         'products.status',
//         'categories.category_id',
//         'categories.category_name',
//         'categories.status',
//         'products.quantity_in_stock',
//         'products.unit_price',
//         'products.product_image',
//         'products.unit'
//       )
//       .limit(limit)
//       .offset(offset);

//     // Fetch vendors for each product
//     const productIds = products.map((product) => product.product_id);

//     const vendors = await knex('product_to_vendor')
//       .select('product_to_vendor.product_id', 'vendors.vendor_id', 'vendors.vendor_name')
//       .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
//       .whereIn('product_to_vendor.product_id', productIds)
//       .andWhere('vendors.status', 1);

//     // Map vendors to their respective products
//     const productVendorMap = {};
//     vendors.forEach((vendor) => {
//       if (!productVendorMap[vendor.product_id]) {
//         productVendorMap[vendor.product_id] = [];
//       }
//       productVendorMap[vendor.product_id].push({
//         vendor_id: vendor.vendor_id,
//         vendor_name: vendor.vendor_name,
//       });
//     });

//     // Add the vendors array to each product
//     products.forEach((product) => {
//       product.vendors = productVendorMap[product.product_id] || [];
//       product.currentQuantity = 0;
//       isSelected = false;
//       selectedVendorId = null;
//     });

//     // Fetch total count
//     const total = await knex('products')
//       .join('categories', 'products.category_id', '=', 'categories.category_id')
//       .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
//       .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
//       .where('products.status', 1)
//       .andWhere('categories.status', 1)
//       .andWhere('vendors.status', 1)
//       .countDistinct('products.product_id as total')
//       .first();

//     return { products, total: total.total, page, limit };
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw error;
//   }
// }


// async function getProducts(page = 1, limit = 5) {
//   try {
//     const offset = (page - 1) * limit;

//     // Fetch the main product data
//     const products = await knex('products')
//       .select(
//         'products.product_id',
//         'products.product_name',
//         'products.status AS product_status',
//         'categories.category_id',
//         'categories.category_name',
//         'categories.status AS category_status',
//         'products.quantity_in_stock',
//         'products.unit_price',
//         'products.product_image',
//         'products.unit'
//       )
//       .join('categories', 'products.category_id', '=', 'categories.category_id')
//       .where('products.status', 1)
//       .andWhere('categories.status', 1)
//       .limit(limit)
//       .offset(offset);

//     // Fetch vendors for each product
//     const productIds = products.map((product) => product.product_id);

//     const vendors = await knex('product_to_vendor')
//       .select('product_to_vendor.product_id', 'vendors.vendor_id', 'vendors.vendor_name')
//       .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
//       .whereIn('product_to_vendor.product_id', productIds)
//       .andWhere('vendors.status', 1);

//     // Map vendors to their respective products
//     const productVendorMap = {};
//     vendors.forEach((vendor) => {
//       if (!productVendorMap[vendor.product_id]) {
//         productVendorMap[vendor.product_id] = [];
//       }
//       productVendorMap[vendor.product_id].push({
//         vendor_id: vendor.vendor_id,
//         vendor_name: vendor.vendor_name,
//       });
//     });

//     // Add the vendors array and additional fields to each product
//     products.forEach((product) => {
//       product.vendors = productVendorMap[product.product_id] || [];
//       product.currentQuantity = 0; // Default value
//       product.isSelected = false; // Default value
//       product.selectedVendorId = null; // Default value
//     });

//     // Fetch total count of products
//     const total = await knex('products')
//       .join('categories', 'products.category_id', '=', 'categories.category_id')
//       .where('products.status', 1)
//       .andWhere('categories.status', 1)
//       .countDistinct('products.product_id as total')
//       .first();

//     return { products, total: total.total, page, limit };
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw error;
//   }
// }

async function getProducts(page = 1, limit = 5, filters = {}) {
  try {
    const offset = (page - 1) * limit;

    // Initialize the base query for products
    const productQuery = knex('products')
      .select(
        'products.product_id',
        'products.product_name',
        'products.status AS product_status',
        'categories.category_id',
        'categories.category_name',
        'categories.status AS category_status',
        'products.quantity_in_stock',
        'products.unit_price',
        'products.product_image',
        'products.unit'
      )
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .where('products.status', 1)
      .andWhere('categories.status', 1)
      .orderBy('products.product_name', 'asc');

    // Apply filters dynamically
    if (filters.productName) {
      productQuery.andWhereRaw('LOWER(products.product_name) LIKE ?', [`%${filters.productName.toLowerCase()}%`]);
    }
    if (filters.status) {
      if (filters.status.toLowerCase() === 'available') {
        productQuery.andWhere('products.quantity_in_stock', '>', 0);
      } else if (filters.status.toLowerCase() === 'sold out') {
        productQuery.andWhere('products.quantity_in_stock', '<=', 0);
      }
    }    
    if (filters.category) {
      productQuery.andWhereRaw('LOWER(categories.category_name) LIKE ?', [`%${filters.category.toLowerCase()}%`]);
    }
    if (filters.vendor) {
      productQuery.whereIn(
        'products.product_id',
        knex('product_to_vendor')
          .select('product_id')
          .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
          .whereRaw('LOWER(vendors.vendor_name) LIKE ?', [`%${filters.vendor.toLowerCase()}%`])
          .andWhere('vendors.status', 1)
      );
    }

    // Add pagination
    productQuery.limit(limit).offset(offset);

    // Execute the query to fetch products
    const products = await productQuery;

    // Fetch vendors for the selected products
    const productIds = products.map((product) => product.product_id);
    const vendors = await knex('product_to_vendor')
      .select('product_to_vendor.product_id', 'vendors.vendor_id', 'vendors.vendor_name')
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
      .whereIn('product_to_vendor.product_id', productIds)
      .andWhere('vendors.status', 1);

    // Map vendors to their respective products
    const productVendorMap = {};
    vendors.forEach((vendor) => {
      if (!productVendorMap[vendor.product_id]) {
        productVendorMap[vendor.product_id] = [];
      }
      productVendorMap[vendor.product_id].push({
        vendor_id: vendor.vendor_id,
        vendor_name: vendor.vendor_name,
      });
    });

    // Enhance products with vendors and default fields
    products.forEach((product) => {
      product.vendors = productVendorMap[product.product_id] || [];
      product.currentQuantity = 0; // Default value
      product.isSelected = false; // Default value
      product.selectedVendorId = null; // Default value
    });

    // Fetch the total count of matching products
    const totalQuery = knex('products')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .where('products.status', 1)
      .andWhere('categories.status', 1);

    // Apply the same filters to the total count query
    if (filters.productName) {
      totalQuery.andWhereRaw('LOWER(products.product_name) LIKE ?', [`%${filters.productName.toLowerCase()}%`]);
    }
    if (filters.status) {
      if (filters.status.toLowerCase() === 'available') {
        productQuery.andWhere('products.quantity_in_stock', '>', 0);
      } else if (filters.status.toLowerCase() === 'sold out') {
        productQuery.andWhere('products.quantity_in_stock', '<=', 0);
      }
    }    
    if (filters.category) {
      totalQuery.andWhereRaw('LOWER(categories.category_name) LIKE ?', [`%${filters.category.toLowerCase()}%`]);
    }
    if (filters.vendor) {
      totalQuery.whereIn(
        'products.product_id',
        knex('product_to_vendor')
          .select('product_id')
          .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
          .whereRaw('LOWER(vendors.vendor_name) LIKE ?', [`%${filters.vendor.toLowerCase()}%`])
          .andWhere('vendors.status', 1)
      );
    }

    const total = await totalQuery.countDistinct('products.product_id as total').first();

    return { products, total: total.total, page, limit };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}





// Fetch all categories
async function getCategories() {
  try {
    const categories = await knex('categories')
      .select('category_id', 'category_name', 'status') // Fetch necessary fields
      .where('status', 1); // Only active categories
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Fetch all vendors
async function getVendors() {
  try {
    const vendors = await knex('vendors')
      .select('vendor_id', 'vendor_name', 'status') // Fetch necessary fields
      .where('status', 1); // Only active vendors
    return vendors;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
}

// // Add Product and Vendor relationship
// async function addProduct(productData) {
//   console.log("Product Data: ", productData);
//   const trx = await knex.transaction(); // Start a transaction

//   try {
//     // Insert the new product into the 'products' table
//     const newProduct = await trx('products')
//       .insert({
//         product_name: productData.productName,
//         category_id: productData.category,
//         quantity_in_stock: productData.quantity,
//         unit_price: productData.unitPrice, 
//         unit: productData.unit,
//         product_image: productData.productImage, // Assuming productData has productImage
//         status: productData.status
//       })

//       console.log("Hello:", newProduct);
      

//     // Insert the relationship into 'product_to_vendor' table
//     const productToVendor = await trx('product_to_vendor')
//       .insert({
//         vendor_id: productData.vendor, // Assuming vendor is the ID
//         product_id: newProduct, // Use the ID of the newly inserted product
//         status: productData.status // Assuming status is the same for vendor
//       })
      

//     // Commit the transaction
//     await trx.commit();

//     // Return the newly added product and vendor relationship
//     return { product: newProduct, productToVendor };

//   } catch (error) {
//     // Rollback the transaction in case of error
//     await trx.rollback();
//     throw error;  // Rethrow the error to be handled by the controller
//   }
// }


async function addProduct(productData, vendors) {
  const trx = await knex.transaction();

  try {
    // Insert the new product
    const newProduct = await trx('products')
      .insert({
        product_name: productData.productName,
        category_id: productData.category,
        quantity_in_stock: productData.quantity,
        unit_price: productData.unitPrice,
        unit: productData.unit,
        product_image: productData.productImage,
        status: productData.status
      })
        // returns product_id

    // Insert the relationships into 'product_to_vendor' table for each vendor
    const productVendorRelationships = vendors.map(vendorId => ({
      vendor_id: vendorId,
      product_id: newProduct,
      status: productData.status
    }));

    await trx('product_to_vendor').insert(productVendorRelationships);

    await trx.commit();
    return { product: newProduct, productToVendor: productVendorRelationships };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}


async function moveToCart(products){
  return knex.transaction(async (trx) => {
    for (const product of products) {
      const { user_id, product_id, vendor_id, quantity } = product;

      // Insert or update the cart entry
      const existingCartItem = await trx('carts')
        .where({ user_id, product_id, vendor_id })
        .first();

      if (existingCartItem) {
        await trx('carts')
          .where({ id: existingCartItem.id })
          .update({ quantity: existingCartItem.quantity + quantity });
      } else {
        await trx('carts').insert({ user_id, product_id, vendor_id, quantity });
      }

      // Decrease the quantity in stock
      await trx('products')
        .where({ product_id })
        .decrement('quantity_in_stock', quantity);
    }
  });
};


// async function getCartItems(userId, page = 1, limit = 5) {
//   try {
//     const offset = (page - 1) * limit;

//     // Fetch the total count of cart items for the user where quantity > 0
//     const totalItemsQuery = knex('carts')
//       .count('* as total')
//       .where('user_id', userId)
//       .andWhere('quantity', '>', 0) // Ensure quantity is greater than 0
//       .first();

//     // Fetch cart items along with related product, category, and vendor information where quantity > 0
//     const cartItemsQuery = knex('carts')
//       .join('products', 'carts.product_id', '=', 'products.product_id')
//       .join('categories', 'products.category_id', '=', 'categories.category_id')
//       .join('product_to_vendor', function () {
//         this.on('products.product_id', '=', 'product_to_vendor.product_id')
//           .andOn('carts.vendor_id', '=', 'product_to_vendor.vendor_id'); // Ensure cart's vendor matches
//       })
//       .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id') // Tie to correct vendor
//       .select(
//         'products.product_id',
//         'products.product_name',
//         'products.product_image',
//         'categories.category_name',
//         'vendors.vendor_name',
//         'carts.quantity',
//         'carts.quantity as initialQuantity',
//         'products.quantity_in_stock'
//       )
//       .where('carts.user_id', userId)
//       .andWhere('carts.quantity', '>', 0) // Ensure quantity is greater than 0
//       .groupBy(
//         'carts.id', // Group by unique cart ID to prevent duplicate rows
//         'products.product_id',
//         'products.product_name',
//         'products.product_image',
//         'categories.category_name',
//         'vendors.vendor_name',
//         'carts.quantity',
//         'products.quantity_in_stock'
//       )
//       .limit(limit)
//       .offset(offset);

//     // Execute both queries in parallel
//     const [totalResult, cartItems] = await Promise.all([totalItemsQuery, cartItemsQuery]);

//     // If no cart items are found for the user, throw an error
//     if (!totalResult.total || cartItems.length === 0) {
//       throw new Error('No cart items found for this user');
//     }

//     return {
//       total: totalResult.total,
//       page,
//       limit,
//       products: cartItems,
//     };
//   } catch (error) {
//     console.error('Error fetching cart items in service:', error);
//     throw error; // Re-throw the error to be handled by the controller
//   }
// }


// async function getCartItems(userId, page = 1, limit = 5) {
//   try {
//     const offset = (page - 1) * limit;

//     // Fetch the total count of cart items for the user where quantity > 0 and product is available
//     const totalItemsQuery = knex('carts')
//       .count('* as total')
//       .where('user_id', userId)
//       .andWhere('quantity', '>', 0) // Ensure quantity is greater than 0
//       .join('products', 'carts.product_id', '=', 'products.product_id')
//       .andWhere('products.status', '=', 1) // Ensure the product is available
//       .first();

//     // Fetch cart items along with related product, category, and vendor information where quantity > 0 and product is available
//     const cartItemsQuery = knex('carts')
//       .join('products', 'carts.product_id', '=', 'products.product_id')
//       .join('categories', 'products.category_id', '=', 'categories.category_id')
//       .join('product_to_vendor', function () {
//         this.on('products.product_id', '=', 'product_to_vendor.product_id')
//           .andOn('carts.vendor_id', '=', 'product_to_vendor.vendor_id'); // Ensure cart's vendor matches
//       })
//       .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id') // Tie to correct vendor
//       .select(
//         'carts.id',
//         'products.product_id',
//         'products.product_name',
//         'products.product_image',
//         'categories.category_name',
//         'vendors.vendor_name',
//         'carts.quantity',
//         'carts.quantity as initialQuantity',
//         'products.quantity_in_stock'
//       )
//       .where('carts.user_id', userId)
//       .andWhere('carts.quantity', '>', 0) // Ensure quantity is greater than 0
//       .andWhere('products.status', '=', 1) // Ensure the product is available
//       .groupBy(
//         'carts.id', // Group by unique cart ID to prevent duplicate rows
//         'products.product_id',
//         'products.product_name',
//         'products.product_image',
//         'categories.category_name',
//         'vendors.vendor_name',
//         'carts.quantity',
//         'products.quantity_in_stock'
//       )
//       .limit(limit)
//       .offset(offset);

//     // Execute both queries in parallel
//     const [totalResult, cartItems] = await Promise.all([totalItemsQuery, cartItemsQuery]);

//     // If no cart items are found for the user, throw an error
//     if (!totalResult.total || cartItems.length === 0) {
//       throw new Error('No cart items found for this user');
//     }

//     return {
//       total: totalResult.total,
//       page,
//       limit,
//       products: cartItems,
//     };
//   } catch (error) {
//     console.error('Error fetching cart items in service:', error);
//     throw error; // Re-throw the error to be handled by the controller
//   }
// }
async function getCartItems(userId, page = 1, limit = 5, filters = {}) {
  try {
    const offset = (page - 1) * limit;

    // Build the initial query for cart items
    let query = knex('carts')
      .join('products', 'carts.product_id', '=', 'products.product_id')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', function () {
        this.on('products.product_id', '=', 'product_to_vendor.product_id')
          .andOn('carts.vendor_id', '=', 'product_to_vendor.vendor_id');
      })
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
      .select(
        'carts.id',
        'products.product_id',
        'products.product_name',
        'products.product_image',
        'categories.category_name',
        'vendors.vendor_name',
        'carts.quantity',
        'carts.quantity as initialQuantity',
        'products.quantity_in_stock'
      )
      .where('carts.user_id', userId)
      .andWhere('carts.quantity', '>', 0)
      .andWhere('products.status', '=', 1)
      .limit(limit)
      .offset(offset);

    // Apply filters if provided
    if (filters.searchTerm) {
      query = query.andWhere(function() {
        this.where('products.product_name', 'like', `%${filters.searchTerm}%`)
            .orWhere('categories.category_name', 'like', `%${filters.searchTerm}%`)
            .orWhere('vendors.vendor_name', 'like', `%${filters.searchTerm}%`);
      });
    }

    if (filters.filterByProductName) {
      query = query.andWhere('products.product_name', 'like', `%${filters.searchTerm}%`);
    }
    if (filters.filterByCategory) {
      query = query.andWhere('categories.category_name', 'like', `%${filters.searchTerm}%`);
    }
    if (filters.filterByVendor) {
      query = query.andWhere('vendors.vendor_name', 'like', `%${filters.searchTerm}%`);
    }

    // Query for the total count of matching products (with applied filters)
    let totalItemsQuery = knex('carts')
      .join('products', 'carts.product_id', '=', 'products.product_id')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', function () {
        this.on('products.product_id', '=', 'product_to_vendor.product_id')
          .andOn('carts.vendor_id', '=', 'product_to_vendor.vendor_id');
      })
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
      .count('* as total')
      .where('carts.user_id', userId)
      .andWhere('carts.quantity', '>', 0)
      .andWhere('products.status', '=', 1);

    // Apply filters to total count query as well
    if (filters.searchTerm) {
      totalItemsQuery = totalItemsQuery.andWhere(function() {
        this.where('products.product_name', 'like', `%${filters.searchTerm}%`)
            .orWhere('categories.category_name', 'like', `%${filters.searchTerm}%`)
            .orWhere('vendors.vendor_name', 'like', `%${filters.searchTerm}%`);
      });
    }

    if (filters.filterByProductName) {
      totalItemsQuery = totalItemsQuery.andWhere('products.product_name', 'like', `%${filters.searchTerm}%`);
    }
    if (filters.filterByCategory) {
      totalItemsQuery = totalItemsQuery.andWhere('categories.category_name', 'like', `%${filters.searchTerm}%`);
    }
    if (filters.filterByVendor) {
      totalItemsQuery = totalItemsQuery.andWhere('vendors.vendor_name', 'like', `%${filters.searchTerm}%`);
    }

    // Execute both queries in parallel
    const [totalResult, cartItems] = await Promise.all([totalItemsQuery, query]);
    //console.log("TotalResult: ", totalResult);
    //console.log("CartItems: ", cartItems);

    // If no cart items are found, return empty products
    if (!totalResult[0].total || cartItems.length === 0) {
      return {
        total: 0,
        page,
        limit,
        products: [],
      };
    }

    return {
      total: totalResult[0].total,
      page,
      limit,
      products: cartItems,
    };
  } catch (error) {
    console.error('Error fetching cart items in service:', error);
    throw error;
  }
}





// Service method to update quantity in cart and product stock within a transaction
async function updateCartItemQuantity(productId, changeInQuantity, userId) {
  console.log("Product_Id:", productId);
  console.log("ChangeInQuantity:", changeInQuantity);
  console.log("UserId:", userId);

  const trx = await knex.transaction(); // Start a transaction

  try {
    // Fetch current product details from the products table
    const product = await trx('products').where('product_id', productId).first();
    if (!product) {
      return { success: false, status: 404, error: 'Product not found' }; // Return error if product not found
    }

    // Calculate the new stock based on change in quantity
    const newStock = product.quantity_in_stock - changeInQuantity;
    if (newStock < 0) {
      await trx.rollback(); // Rollback transaction if stock is insufficient
      return { success: false, status: 400, error: 'Not enough stock available' };
    }

    // Fetch current cart item details
    const cartItem = await trx('carts')
      .where('product_id', productId)
      .andWhere('user_id', userId)
      .first();

    if (!cartItem) {
      await trx.rollback(); // Rollback transaction if cart item does not exist
      return { success: false, status: 404, error: 'Cart item not found' };
    }

    // Calculate the updated cart quantity
    const updatedCartQuantity = cartItem.quantity + changeInQuantity;

    if (updatedCartQuantity < 0) {
      await trx.rollback(); // Rollback transaction if the cart quantity is invalid
      return { success: false, status: 400, error: 'Invalid cart quantity' };
    }

    // Update the quantity in the cart table
    await trx('carts')
      .where('product_id', productId)
      .andWhere('user_id', userId)
      .update({ quantity: updatedCartQuantity });

    // Update the product's stock in the products table
    await trx('products')
      .where('product_id', productId)
      .update({ quantity_in_stock: newStock });

    // Commit the transaction if all operations succeed
    await trx.commit();

    return { success: true }; // Return success status
  } catch (error) {
    await trx.rollback(); // Rollback transaction in case of error
    console.error('Error updating cart item and product:', error);
    return { success: false, status: 500, error: 'Failed to update cart item and product' };
  }
}


async function deleteProductAndVendors(productId) {
  try {
    // Start a transaction to ensure atomicity
    return await knex.transaction(async (trx) => {
      // Update the status of the product in the products table
      await trx('products')
        .where('product_id', productId)
        .update({ status: 99 });

      // Update the status of the product in the product_to_vendor table
      await trx('product_to_vendor')
        .where('product_id', productId)
        .update({ status: 99 });

      // Commit the transaction
      await trx.commit();
    });
  } catch (error) {
    console.error('Error updating product status in service:', error);
    throw error; // Re-throw the error to be handled by the controller
  }
}

//for edit in row
async function updateProductAndVendors(product_id, productData) {
  const { productImage, product_name, quantity_in_stock, selectedVendorIds, unit, category_id } = productData;

  const trx = await knex.transaction();

  try {
    // Update the product table
    await trx('products')
      .where('product_id', product_id)
      .update({
        product_image: productImage || null,  // If productImage is provided, update it; otherwise, set as null
        product_name,
        quantity_in_stock,
        unit,
        category_id,
      });

    // Check if selectedVendorIds is not empty before modifying the product_to_vendor table
    if (selectedVendorIds && selectedVendorIds.length > 0) {
      // First, delete existing product_vendor associations
      await trx('product_to_vendor')
        .where('product_id', product_id)
        .del();

      // Ensure selectedVendorIds is an array
      const vendors = Array.isArray(selectedVendorIds) ? selectedVendorIds : [selectedVendorIds];

      // Insert new associations for selected vendors
      const vendorAssociations = vendors.map(vendor_id => ({
        product_id,
        vendor_id,
        status: 1  // Set the status to 1 (active)
      }));

      await trx('product_to_vendor').insert(vendorAssociations);
    }

    // Commit the transaction
    await trx.commit();
    return { success: true };
  } catch (error) {
    // Rollback the transaction in case of an error
    await trx.rollback();
    console.error('Error during product update transaction:', error);
    throw error;  // Rethrow the error to be caught by the controller
  }
}


// Function to delete cart item and update product stock
async function deleteCartItem(cartId) {
  const trx = await knex.transaction();

  try {
    // Fetch the cart item to get product_id and quantity
    const cartItem = await trx('carts')
      .where('id', cartId)
      .first();

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    const { product_id, quantity } = cartItem;

    // Update the quantity in stock for the product
    await trx('products')
      .where('product_id', product_id)
      .increment('quantity_in_stock', quantity); // Add the quantity back to the product stock

    // Delete the cart item
    await trx('carts')
      .where('id', cartId)
      .del();

    // Commit the transaction
    await trx.commit();
  } catch (error) {
    // Rollback the transaction in case of an error
    await trx.rollback();
    console.error('Error during cart item deletion:', error);
    throw error;  // Rethrow the error to be caught by the controller
  }
}



async function updateProductDetails(data) {
  const trx = await knex.transaction(); // Start a transaction

  try {
    for (const row of data) {
      const { 
        Category: categoryName, 
        'Product Name': productName, 
        Quantity: quantity, 
        Status: status, 
        Unit: unit, 
        Vendors: vendors 
      } = row;

      // Map status to a numeric value
      const productStatus = status === "Available" ? 1 : 99;

      // Find or create category
      let categoryId;
      const [existingCategory] = await trx('categories').where({ category_name: categoryName });
      if (!existingCategory) {
        [categoryId] = await trx('categories').insert({ category_name: categoryName, status: 1 });
      } else {
        categoryId = existingCategory.category_id;
      }

      // Find or create product
      let productId;
      const [existingProduct] = await trx('products')
        .where({ product_name: productName, category_id: categoryId });
      if (!existingProduct) {
        [productId] = await trx('products').insert({
          product_name: productName,
          category_id: categoryId,
          quantity_in_stock: quantity,
          unit: unit,
          status: productStatus,
        });
      } else {
        productId = existingProduct.product_id;
        await trx('products')
          .where({ product_id: productId })
          .update({
            quantity_in_stock: quantity,
            unit: unit,
            status: productStatus,
          });
      }
      console.log("Product Id: ", productId);

      // Process vendors
      const vendorNames = vendors.split(',').map((v) => v.trim());
      for (const vendorName of vendorNames) {
        let vendorId;
        const [existingVendor] = await trx('vendors').where({ vendor_name: vendorName });
        if (!existingVendor) {
          [vendorId] = await trx('vendors').insert({ vendor_name: vendorName, status: 1 });
        } else {
          vendorId = existingVendor.vendor_id;
        }
        console.log("Vendor Id: ", vendorId);

        // Link product to vendor if not already linked
        const [existingLink] = await trx('product_to_vendor')
          .where({ product_id: productId, vendor_id: vendorId });
        
        console.log("Existing Link: ", existingLink);
        if (!existingLink) {
          await trx('product_to_vendor').insert({
            product_id: productId,
            vendor_id: vendorId,
            status: 1, // Set status to 1 in the product_to_vendor table
          });
        }
      }
    }

    // Commit the transaction after all operations are successful
    await trx.commit();
    console.log('Transaction committed successfully.');
  } catch (error) {
    // Rollback the transaction in case of error
    await trx.rollback();
    console.error('Transaction failed, rolled back:', error);
  }
}


async function fetchAllUsers() {
  try {
    const users = await knex('users').select('id', 'username');
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// async function fetchMessages(userId) {
//   try {
//     const messages = await knex('messages')
//       .select('users.username as sender', 'messages.message as text')
//       .join('users', 'messages.sender_id', 'users.id')
//       .where('messages.receiver_id', userId)
//       .orWhere('messages.sender_id', userId)
//       .orderBy('messages.created_at', 'asc');

//     return messages;
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     throw error;
//   }
// }

// async function saveMessageToDatabase(senderId, receiverId, text, isRead){
//   knex('messages').insert({
//     sender_id: senderId,
//     receiver_id: receiverId,
//     message: text,
//     is_read: isRead,
//   }).then(() => {
//     console.log('Message saved to database.');
//   }).catch(err => {
//     console.error('Error saving message to database:', err);
//   });
// };


async function getActiveUsers() {
  return knex("users").where("is_active", true).select("id", "username", "thumbnail");
}




// async function processImportedFile() {
//   try {
//     const files = await knex('imported_files').where('status', 'pending');
//     console.log("Files to process: ", files.length);

//     for (const file of files) {
//       const fileKey = file.file_key.replace(
//         `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
//         ''
//       );

//       const params = {
//         Bucket: process.env.AWS_S3_BUCKET_NAME,
//         Key: fileKey,
//       };

//       const fileStream = s3.getObject(params).createReadStream();
//       const workbook = new ExcelJS.Workbook();
//       await workbook.xlsx.read(fileStream);

//       const worksheet = workbook.getWorksheet(1);
//       const invalidRecords = [];
//       const validRecords = [];
      

//       worksheet.eachRow((row, rowNumber) => {
//         if (rowNumber === 1) return; // Skip header row
//         console.log("RowNumber: ", rowNumber);

//         const productName = row.getCell(1).value;
//         const status = row.getCell(2).value;
//         const category = row.getCell(3).value;
//         const vendor = row.getCell(4).value;
//         const quantity = row.getCell(5).value;
//         const unitPrice = row.getCell(6).value;

//         if (!productName || !status || !category || !vendor || !quantity || !unitPrice) {
//           invalidRecords.push({ 
//             rowNumber, 
//             productName, 
//             status,
//             category, 
//             vendor, 
//             quantity, 
//             unitPrice, 
//             error: 'Missing required fields' 
//           });
//           return;
//         }

//         validRecords.push({ rowNumber, productName, status, category, vendor, quantity, unitPrice });
//       });

//       console.log(`Valid rows before DB validation: ${validRecords.length}, Invalid rows: ${invalidRecords.length}`);

//       // Validate category and vendor in the database
//       const finalValidRecords = [];

//       for (const record of validRecords) {
//         const category = await knex('categories').where('category_name', record.category).first();
//         const vendor = await knex('vendors').where('vendor_name', record.vendor).first();

//         if (!category || !vendor) {
//           invalidRecords.push({ ...record, error: 'Invalid category or vendor' });
//           continue;
//         }

//         const product = {
//           product_name: record.productName,
//           status: record.status === 'Available' ? 1 : 99,
//           category_id: category.category_id,
//           quantity_in_stock: record.quantity,
//           unit_price: record.unitPrice,
//         };

//         const [productId] = await knex('products').insert(product);

//         await knex('product_to_vendor').insert({
//           product_id: productId,
//           vendor_id: vendor.vendor_id,
//           status: record.status === 'Available' ? 1 : 99,
//         });

//         finalValidRecords.push(product);
//       }

//       console.log(`Final valid rows after category/vendor validation: ${finalValidRecords.length}`);
//       console.log(`Total invalid rows (including missing category/vendor): ${invalidRecords.length}`);

//       // Generate and upload error file if there are invalid records
//       let errorFileKey = null;

//       if (invalidRecords.length > 0) {
//         errorFileKey = `errors/${file.username}/${file.user_id}/${uuidv4()}_errors.xlsx`;
//         const errorWorkbook = new ExcelJS.Workbook();
//         const errorWorksheet = errorWorkbook.addWorksheet('Errors');

//         errorWorksheet.columns = [
//           { header: 'Row Number', key: 'rowNumber' },
//           { header: 'Product Name', key: 'productName' },
//           { header: 'Status', key: 'status' },
//           { header: 'Category', key: 'category' },
//           { header: 'Vendor', key: 'vendor' },
//           { header: 'Quantity', key: 'quantity' },
//           { header: 'Unit Price', key: 'unitPrice' },
//           { header: 'Error', key: 'error' },
//         ];

//         errorWorksheet.addRows(invalidRecords);
//         const errorFilePath = path.join(__dirname, '../../uploads', `errors_${uuidv4()}.xlsx`);
//         await errorWorkbook.xlsx.writeFile(errorFilePath);

//         const errorParams = {
//           Bucket: process.env.AWS_S3_BUCKET_NAME,
//           Key: errorFileKey,
//           Body: fs.createReadStream(errorFilePath),
//         };

//         await s3.upload(errorParams).promise();
//         fs.unlinkSync(errorFilePath);
//       }
//       const errorFileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${errorFileKey}`;
//       // Update the file status in the database
//       await knex('imported_files')
//         .where('id', file.id)
//         .update({ status: invalidRecords.length > 0 ? 'error' : 'completed', error_file_key: errorFileUrl });

//       console.log(`File ${file.id} processed: Status - ${invalidRecords.length > 0 ? 'error' : 'completed'}`);
//     }
//   } catch (error) {
//     console.error('Error processing uploaded files:', error);
//   }
// }

async function processImportedFile() {
  const trx = await knex.transaction();
  try {
    const files = await trx('imported_files').where('status', 'pending');
    console.log("Files to process: ", files.length);

    for (const file of files) {
      const fileKey = file.file_key.replace(
        `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
        ''
      );

      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
      };

      const fileStream = s3.getObject(params).createReadStream();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.read(fileStream);
      const worksheet = workbook.getWorksheet(1);
      
      const invalidRecords = [];
      const validRecords = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const productName = row.getCell(1).value;
        const status = row.getCell(2).value;
        const category = row.getCell(3).value;
        const vendor = row.getCell(4).value;
        const quantity = parseInt(row.getCell(5).value, 10);
        const unitPrice = parseFloat(row.getCell(6).value);

        if (!productName || typeof productName !== 'string' || productName.trim() === '') {
          invalidRecords.push({ rowNumber, productName, status, category, vendor, quantity, unitPrice, error: 'Invalid product name' });
          return;
        }

        if (!Number.isInteger(quantity) || quantity < 0) {
          invalidRecords.push({ rowNumber, productName, status, category, vendor, quantity, unitPrice, error: 'Invalid quantity (must be a positive integer)' });
          return;
        }

        if (isNaN(unitPrice) || unitPrice <= 0) {
          invalidRecords.push({ rowNumber, productName, status, category, vendor, quantity, unitPrice, error: 'Invalid unit price (must be a positive decimal)' });
          return;
        }

        if (!status || typeof status !== 'string' || status.trim() === '' ) {
          invalidRecords.push({ rowNumber, productName, status, category, vendor, quantity, unitPrice, error: 'Invalid status value' });
          return;
        }

        validRecords.push({ rowNumber, productName, status, category, vendor, quantity, unitPrice });
      });

      console.log(`Valid rows before DB validation: ${validRecords.length}, Invalid rows: ${invalidRecords.length}`);
      
      const finalValidRecords = [];
      for (const record of validRecords) {
        const category = await trx('categories').where('category_name', record.category).first();
        const vendor = await trx('vendors').where('vendor_name', record.vendor).first();

        if (!category || !vendor) {
          invalidRecords.push({ ...record, error: 'Invalid category or vendor' });
          continue;
        }

        const product = {
          product_name: record.productName,
          status: record.status === 'Available' ? 1 : 99,
          category_id: category.category_id,
          quantity_in_stock: record.quantity,
          unit_price: record.unitPrice,
        };

        const [productId] = await trx('products').insert(product);
        await trx('product_to_vendor').insert({
          product_id: productId,
          vendor_id: vendor.vendor_id,
          status: record.status === 'Available' ? 1 : 99,
        });

        finalValidRecords.push(product);
      }
      console.log(`Final valid rows after category/vendor validation: ${finalValidRecords.length}`);

      let errorFileUrl = null;
      if (invalidRecords.length > 0) {
        const errorFileKey = `errors/${file.username}/${file.user_id}/${uuidv4()}_errors.xlsx`;
        const errorWorkbook = new ExcelJS.Workbook();
        const errorWorksheet = errorWorkbook.addWorksheet('Errors');

        errorWorksheet.columns = [
          { header: 'Row Number', key: 'rowNumber' },
          { header: 'Product Name', key: 'productName' },
          { header: 'Status', key: 'status' },
          { header: 'Category', key: 'category' },
          { header: 'Vendor', key: 'vendor' },
          { header: 'Quantity', key: 'quantity' },
          { header: 'Unit Price', key: 'unitPrice' },
          { header: 'Error', key: 'error' },
        ];
        errorWorksheet.addRows(invalidRecords);
        
        const errorFilePath = path.join(__dirname, '../../uploads', `errors_${uuidv4()}.xlsx`);
        await errorWorkbook.xlsx.writeFile(errorFilePath);

        const errorParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: errorFileKey,
          Body: fs.createReadStream(errorFilePath),
        };

        await s3.upload(errorParams).promise();
        fs.unlinkSync(errorFilePath);
        errorFileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${errorFileKey}`;
      }
      
      await trx('imported_files')
        .where('id', file.id)
        .update({ status: invalidRecords.length > 0 ? 'error' : 'completed', error_file_key: errorFileUrl });

      console.log(`File ${file.id} processed: Status - ${invalidRecords.length > 0 ? 'error' : 'completed'}`);
    }

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    console.error('Error processing uploaded files:', error);
  }
}

module.exports = {
  fetchUserInfo,
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
  updateProductDetails,
  fetchAllUsers,
  //fetchMessages,
  getActiveUsers,
  //saveMessageToDatabase,
  processImportedFile,
  

};
