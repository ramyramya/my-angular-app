// filepath: /src/swagger.js
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation',
    },
  },
  apis: [path.join(__dirname, 'v1/**/api-docs/*.swagger.js')], // Wildcard pattern to include all Swagger docs
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};