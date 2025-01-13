/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = function (knex) {
  return knex('categories')
    .del()
    .then(function () {
      return knex('categories').insert([
        { category_name: 'Electronics', description: 'Devices and gadgets', status: 1 },
        { category_name: 'Clothing', description: 'Apparel and fashion', status: 1 },
        { category_name: 'Furniture', description: 'Home and office furniture', status: 1 },
        { category_name: 'Books', description: 'Books and magazines', status: 1 },
        { category_name: 'Toys', description: 'Toys and games for kids', status: 1 },
        { category_name: 'Sports', description: 'Sporting goods and equipment', status: 1 },
        { category_name: 'Beauty', description: 'Beauty and personal care', status: 1 },
        { category_name: 'Automotive', description: 'Car accessories and tools', status: 1 },
        { category_name: 'Jewelry', description: 'Jewelry and accessories', status: 1 },
        { category_name: 'Music', description: 'Instruments and albums', status: 1 },
        { category_name: 'Health', description: 'Healthcare products', status: 1 },
        { category_name: 'Home Decor', description: 'Decorative items for home', status: 1 },
        { category_name: 'Gardening', description: 'Gardening tools and seeds', status: 1 },
        { category_name: 'Stationery', description: 'Office and school supplies', status: 1 },
        { category_name: 'Groceries', description: 'Daily essentials and food', status: 1 },
        { category_name: 'Footwear', description: 'Shoes and sandals', status: 1 },
        { category_name: 'Pet Supplies', description: 'Products for pets', status: 1 },
        { category_name: 'Appliances', description: 'Home appliances', status: 1 },
        { category_name: 'Gaming', description: 'Video games and consoles', status: 1 },
        { category_name: 'Hardware', description: 'Tools and building materials', status: 1 },
      ]);
    });
};


