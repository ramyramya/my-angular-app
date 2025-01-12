/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('products', function (table) {
      table.increments('product_id').primary();
      table.string('product_name').notNullable();
      table.integer('category_id').unsigned().references('category_id').inTable('categories').onDelete('CASCADE');
      table.integer('quantity_in_stock').defaultTo(0);
      table.decimal('unit_price', 10, 2).notNullable();
      table.string('product_image');
      table.integer('status', [0, 1, 2, 99]).defaultTo(0);
      table.timestamps(true, true);
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('products');
  };