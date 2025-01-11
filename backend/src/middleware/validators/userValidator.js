// filepath: /src/middleware/validators/userValidator.js
const Joi = require('joi');

const userSchema = Joi.object({
  firstname: Joi.string().min(1).max(255).required(),
  lastname: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

module.exports = userSchema;