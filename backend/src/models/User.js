const { Model } = require('objection');

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstname', 'lastname', 'email', 'password'],
      properties: {
        id: { type: 'integer' },
        firstname: { type: 'string', minLength: 1, maxLength: 255 },
        lastname: { type: 'string', minLength: 1, maxLength: 255 },
        username: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        profile_pic: { type: ['string', 'null'], maxLength: 1024 }, // Optional field with null default
        thumbnail: { type: ['string', 'null'], maxLength: 1024 }, // Optional field with null default
        status: { type: 'integer', enum: [1, 2, 99], default: 1 } // Enum for status
      }
    };
  }
}

module.exports = User;
