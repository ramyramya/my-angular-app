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

//     const products = await knex('products')
//       .select(
//         'products.product_name',
//         'products.status AS product_status',
//         'categories.category_name',
//         'categories.status AS category_status',
//         'vendors.vendor_name',
//         'vendors.status AS vendor_status',
//         'products.quantity_in_stock',
//         'products.unit_price',
//         'products.product_image',
//         'products.unit'
//       )
//       .join('categories', 'products.category_id', '=', 'categories.category_id')
//       .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
//       .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
//       .where('products.status', 1)
//       .andWhere('categories.status', 1)
//       .andWhere('vendors.status', 1)
//       .limit(limit)
//       .offset(offset);

//     const total = await knex('products')
//       .join('categories', 'products.category_id', '=', 'categories.category_id')
//       .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
//       .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
//       .where('products.status', 1)
//       .andWhere('categories.status', 1)
//       .andWhere('vendors.status', 1)
//       .count('* as total')
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
      .groupBy(
        'products.product_id',
        'products.product_name',
        'products.status',
        'categories.category_id',
        'categories.category_name',
        'categories.status',
        'products.quantity_in_stock',
        'products.unit_price',
        'products.product_image',
        'products.unit'
      )
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

    // Add the vendors array to each product
    products.forEach((product) => {
      product.vendors = productVendorMap[product.product_id] || [];
      product.currentQuantity = 0;
      isSelected = false;
      selectedVendorId = null;
    });

    // Fetch total count
    const total = await knex('products')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
      .where('products.status', 1)
      .andWhere('categories.status', 1)
      .andWhere('vendors.status', 1)
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


module.exports = {
  fetchUserInfo,
  getVendorCount,
  getProducts,
  getCategories,
  getVendors,
  addProduct,
  moveToCart
};
