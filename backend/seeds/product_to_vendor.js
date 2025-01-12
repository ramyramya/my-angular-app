/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = function (knex) {
  return knex('product_to_vendor')
    .del()
    .then(function () {
      return knex('product_to_vendor').insert([
        {
          vendor_id: 1, // Assuming vendor_id for TechStore is 1
          product_id: 5, // Assuming product_id for Smartphone is 1
          status: 1,
        },
        {
          vendor_id: 2, // Assuming vendor_id for FashionHub is 2
          product_id: 6, // Assuming product_id for Jeans is 2
          status: 1,
        },
      ]);
    });
};
