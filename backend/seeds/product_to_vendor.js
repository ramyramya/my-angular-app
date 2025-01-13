/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = function (knex) {
  return knex('product_to_vendor')
    .del()
    .then(function () {
      return knex('product_to_vendor').insert([
        { vendor_id: 3, product_id: 7, status: 1 },
        { vendor_id: 4, product_id: 8, status: 1 },
        { vendor_id: 5, product_id: 9, status: 1 },
        { vendor_id: 6, product_id: 10, status: 1 },
        { vendor_id: 7, product_id: 11, status: 1 },
        { vendor_id: 8, product_id: 12, status: 1 },
        { vendor_id: 9, product_id: 13, status: 1 },
        { vendor_id: 10, product_id: 14, status: 1 },
        { vendor_id: 3, product_id: 15, status: 1 },
        { vendor_id: 4, product_id: 16, status: 1 },
        { vendor_id: 5, product_id: 17, status: 1 },
        { vendor_id: 6, product_id: 18, status: 1 },
        { vendor_id: 7, product_id: 19, status: 1 },
        { vendor_id: 8, product_id: 20, status: 1 },
        { vendor_id: 9, product_id: 21, status: 1 },
        { vendor_id: 10, product_id: 22, status: 1 },
      ]);
    });
};
