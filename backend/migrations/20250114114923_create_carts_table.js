/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
    return knex.schema
        .createTable('carts', (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable();
            table.integer('product_id').unsigned().notNullable();
            table.integer('vendor_id').unsigned().notNullable();
            table.integer('quantity').notNullable().defaultTo(1);
            table.timestamps(true, true);

            // Foreign key constraints
            table.foreign('user_id').references('users.id').onDelete('CASCADE');
            table.foreign('product_id').references('products.product_id').onDelete('CASCADE'); // Correct reference
            table.foreign('vendor_id').references('vendors.vendor_id').onDelete('CASCADE');

            // Unique constraint
            table.unique(['user_id', 'product_id', 'vendor_id']);
        });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('carts');
};
