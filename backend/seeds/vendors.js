/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = function (knex) {
  return knex('vendors')
    .del()
    .then(function () {
      return knex('vendors').insert([
        {
          vendor_name: 'TechStore',
          contact_name: 'John Doe',
          address: '123 Tech Street',
          city: 'Tech City',
          postal_code: '12345',
          country: 'USA',
          phone: '123-456-7890',
          status: 1,
        },
        {
          vendor_name: 'FashionHub',
          contact_name: 'Jane Smith',
          address: '456 Fashion Avenue',
          city: 'Fashion City',
          postal_code: '67890',
          country: 'USA',
          phone: '987-654-3210',
          status: 1,
        },
      ]);
    });
};
