/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('users', function(table) {
      table.string('profile_pic'); // Optional field for profile picture URL
      table.string('thumbnail'); // Optional field for thumbnail URL
      table.enu('status', [1, 2, 99]).defaultTo(1); // Enum for status with default value of 1
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable('users', function(table) {
      table.dropColumn('profile_pic');
      table.dropColumn('thumbnail');
      table.dropColumn('status');
    });
  };
  