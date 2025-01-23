exports.up = function (knex) {
    return knex.schema.alterTable('users', (table) => {
      table.string('resetToken').nullable();
      table.timestamp('resetTokenExpiry').nullable();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('users', (table) => {
      table.dropColumn('resetToken');
      table.dropColumn('resetTokenExpiry');
    });
  };
  