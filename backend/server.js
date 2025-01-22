const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./src/v1/routes');
const { Model } = require('./src/mysql/objection')
require('dotenv').config();
const encryptionMiddleware = require('./src/middleware/encryptionMiddleware');
const { swaggerUi, specs } = require('./src/swagger');

const app = express();

// Enable CORS
app.use(cors());

app.use(bodyParser.json());
app.use((req, res, next) => {
  if (req.path.startsWith('/api-docs')) {
    return next();
  }
  encryptionMiddleware(req, res, next);
});

app.use('/api/v1', routes);


// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});