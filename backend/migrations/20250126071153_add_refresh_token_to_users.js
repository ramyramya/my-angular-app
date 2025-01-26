/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
      // Add refreshToken column to store the refresh token
      table.string('refreshToken').nullable();  // nullable, as not every user may have a refresh token immediately
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
      // Drop the refreshToken column if we rollback the migration
      table.dropColumn('refreshToken');
    });
  };
  