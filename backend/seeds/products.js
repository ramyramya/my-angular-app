/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
  return knex('products')
    .del() // Delete all existing records in the products table
    .then(function () {
      return knex('products').insert([
        {
          product_name: 'Smartphone',
          category_id: 4, // Assuming category_id for Electronics is 1
          quantity_in_stock: 50,
          unit_price: 499.99,
          product_image: 'smartphone.jpg',
          status: 1,
          unit: 'piece', // Each smartphone is considered a "piece"
        },
        {
          product_name: 'Jeans',
          category_id: 6, // Assuming category_id for Clothing is 2
          quantity_in_stock: 200,
          unit_price: 39.99,
          product_image: 'jeans.jpg',
          status: 1,
          unit: 'pair', // Each pair of jeans is considered a "pair"
        },
      ]);
    });
};
