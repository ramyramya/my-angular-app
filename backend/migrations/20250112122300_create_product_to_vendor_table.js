/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('product_to_vendor', function (table) {
      table.increments('product_to_vendor_id').primary();
      table.integer('vendor_id').unsigned().references('vendor_id').inTable('vendors').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('product_id').inTable('products').onDelete('CASCADE');
      table.integer('status', [0, 1, 2, 99]).defaultTo(0);
      table.timestamps(true, true);
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
    return knex.schema.dropTable('product_to_vendor');
  };
