/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('categories')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('categories').insert([
        { category_name: 'Electronics', description: 'Devices and gadgets', status: 1 },
        { category_name: 'Clothing', description: 'Apparel and fashion', status: 1 },
        { category_name: 'Furniture', description: 'Home and office furniture', status: 1 },
      ]);
    });
};

