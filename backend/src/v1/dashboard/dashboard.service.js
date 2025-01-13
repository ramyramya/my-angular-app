const knex = require('../../mysql/knex');

async function fetchUserInfo(userId) {
  try {
    const user = await knex('users')
      .select('username', 'profile_pic', 'email')
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

/*async function getProducts() {
  try {
    const products = await knex('products')
      .select(
        'products.product_name',
        'products.status AS product_status', // Status of the product
        'categories.category_name',
        'categories.status AS category_status', // Status of the category
        'vendors.vendor_name',
        'vendors.status AS vendor_status', // Status of the vendor
        'products.quantity_in_stock',
        'products.unit_price',
        'products.product_image',
        'products.unit'
      )
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id') // Join with product_to_vendor
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id') // Join with vendors using product_to_vendor
      .where('products.status', 1) // Example: Only active products
      .andWhere('categories.status', 1) // Example: Only active categories
      .andWhere('vendors.status', 1); // Example: Only active vendors
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}*/

async function getProducts(page = 1, limit = 5) {
  try {
    const offset = (page - 1) * limit;

    const products = await knex('products')
      .select(
        'products.product_name',
        'products.status AS product_status',
        'categories.category_name',
        'categories.status AS category_status',
        'vendors.vendor_name',
        'vendors.status AS vendor_status',
        'products.quantity_in_stock',
        'products.unit_price',
        'products.product_image',
        'products.unit'
      )
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
      .where('products.status', 1)
      .andWhere('categories.status', 1)
      .andWhere('vendors.status', 1)
      .limit(limit)
      .offset(offset);

    const total = await knex('products')
      .join('categories', 'products.category_id', '=', 'categories.category_id')
      .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
      .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
      .where('products.status', 1)
      .andWhere('categories.status', 1)
      .andWhere('vendors.status', 1)
      .count('* as total')
      .first();

    return { products, total: total.total, page, limit };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}




module.exports = {
  fetchUserInfo,
  getVendorCount,
  getProducts
};
