exports.up = function (knex) {
    return knex.schema.alterTable('imported_files', function (table) {
      table.integer('total_records').defaultTo(0);
    }).then(() => {
      return knex.schema.alterTable('imported_files', function (table) {
        table.integer('valid_records').defaultTo(0);
      });
    }).then(() => {
      return knex.schema.alterTable('imported_files', function (table) {
        table.integer('invalid_records').defaultTo(0);
      });
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('imported_files', function (table) {
      table.dropColumn('total_records');
    }).then(() => {
      return knex.schema.alterTable('imported_files', function (table) {
        table.dropColumn('valid_records');
      });
    }).then(() => {
      return knex.schema.alterTable('imported_files', function (table) {
        table.dropColumn('invalid_records');
      });
    });
};

