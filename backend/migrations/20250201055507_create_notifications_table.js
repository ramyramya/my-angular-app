/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('notifications', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users').onDelete('CASCADE');
      table.integer('file_id').unsigned().notNullable()
        .references('id').inTable('imported_files').onDelete('CASCADE');
      table.text('message').notNullable();
      table.enu('status', ['unread', 'read']).defaultTo('unread');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.dropTable('notifications');
  };
  
