exports.up = function (knex) {
    return knex.schema.createTable('imported_files', function (table) {
      table.increments('id').primary();
      table.string('file_key').notNullable();
      table.string('username').notNullable();
      table.integer('user_id').notNullable();
      table.string('status').notNullable();
      table.string('error_file_key').nullable();
      table.timestamps(true, true);
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('imported_files');
  };