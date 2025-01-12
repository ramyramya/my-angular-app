/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.schema.createTable('vendors', function (table) {
    table.increments('vendor_id').primary();
    table.string('vendor_name').notNullable();
    table.string('contact_name');
    table.text('address');
    table.string('city');
    table.string('postal_code');
    table.string('country');
    table.string('phone');
    table.integer('status', [0, 1, 2, 99]).defaultTo(0);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
    return knex.schema.dropTable('vendors');
  };
