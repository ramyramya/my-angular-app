/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('messages', function(table) {
        table.boolean('is_read').defaultTo(false); // Track whether the message is read
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('messages', function(table) {
        table.dropColumn('is_read'); // Remove column if rolling back
    });
};
