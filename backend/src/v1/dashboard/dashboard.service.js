const knex = require('../../mysql/knex');

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


async function getProducts(page = 1, limit = 5) {
  try {
    const offset = (page - 1) * limit;

    // Fetch the main product data
    const products = await knex('products')
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
      .limit(limit)
      .offset(offset);

    // Fetch vendors for each product
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

    // Add the vendors array and additional fields to each product
    products.forEach((product) => {
      product.vendors = productVendorMap[product.product_id] || [];
      product.currentQuantity = 0; // Default value
      product.isSelected = false; // Default value
      product.selectedVendorId = null; // Default value
    });

    // Fetch total count of products
    const total = await knex('products')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .where('products.status', 1)
      .andWhere('categories.status', 1)
      .countDistinct('products.product_id as total')
      .first();

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

// Add Product and Vendor relationship
async function addProduct(productData) {
  console.log("Product Data: ", productData);
  const trx = await knex.transaction(); // Start a transaction

  try {
    // Insert the new product into the 'products' table
    const newProduct = await trx('products')
      .insert({
        product_name: productData.productName,
        category_id: productData.category,
        quantity_in_stock: productData.quantity,
        unit_price: productData.unitPrice, 
        unit: productData.unit,
        product_image: productData.productImage, // Assuming productData has productImage
        status: productData.status
      })

      console.log("Hello:", newProduct);
      

    // Insert the relationship into 'product_to_vendor' table
    const productToVendor = await trx('product_to_vendor')
      .insert({
        vendor_id: productData.vendor, // Assuming vendor is the ID
        product_id: newProduct, // Use the ID of the newly inserted product
        status: productData.status // Assuming status is the same for vendor
      })
      

    // Commit the transaction
    await trx.commit();

    // Return the newly added product and vendor relationship
    return { product: newProduct, productToVendor };

  } catch (error) {
    // Rollback the transaction in case of error
    await trx.rollback();
    throw error;  // Rethrow the error to be handled by the controller
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

// 

async function getCartItems(userId, page = 1, limit = 5) {
  try {
    const offset = (page - 1) * limit;

    // Fetch the total count of cart items for the user where quantity > 0
    const totalItemsQuery = knex('carts')
      .count('* as total')
      .where('user_id', userId)
      .andWhere('quantity', '>', 0) // Ensure quantity is greater than 0
      .first();

    // Fetch cart items along with related product, category, and vendor information where quantity > 0
    const cartItemsQuery = knex('carts')
      .join('products', 'carts.product_id', '=', 'products.product_id')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', function () {
        this.on('products.product_id', '=', 'product_to_vendor.product_id')
          .andOn('carts.vendor_id', '=', 'product_to_vendor.vendor_id'); // Ensure cart's vendor matches
      })
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id') // Tie to correct vendor
      .select(
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
      .andWhere('carts.quantity', '>', 0) // Ensure quantity is greater than 0
      .groupBy(
        'carts.id', // Group by unique cart ID to prevent duplicate rows
        'products.product_id',
        'products.product_name',
        'products.product_image',
        'categories.category_name',
        'vendors.vendor_name',
        'carts.quantity',
        'products.quantity_in_stock'
      )
      .limit(limit)
      .offset(offset);

    // Execute both queries in parallel
    const [totalResult, cartItems] = await Promise.all([totalItemsQuery, cartItemsQuery]);

    // If no cart items are found for the user, throw an error
    if (!totalResult.total || cartItems.length === 0) {
      throw new Error('No cart items found for this user');
    }

    return {
      total: totalResult.total,
      page,
      limit,
      products: cartItems,
    };
  } catch (error) {
    console.error('Error fetching cart items in service:', error);
    throw error; // Re-throw the error to be handled by the controller
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


// Update product and associate vendors with a transaction
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
        category_id
      });

    // First, delete existing product_vendor associations
    await trx('product_to_vendor')
      .where('product_id', product_id)
      .del();

    // Ensure selectedVendorIds is an array
    const vendors = Array.isArray(selectedVendorIds) ? selectedVendorIds : [selectedVendorIds];

    // Insert new associations for selected vendors
    if (vendors.length > 0) {
      const vendorAssociations = vendors.map(vendor_id => ({
        product_id,
        vendor_id
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
  updateProductAndVendors
};
