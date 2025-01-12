/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('products', function (table) {
      table.string('unit');  // Add the "unit" column of type string
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.table('products', function (table) {
      table.dropColumn('unit');  // Drop the "unit" column when rolling back
    });
  };
  