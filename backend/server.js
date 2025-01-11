const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./src/v1/routes');
const { Model } = require('./src/mysql/objection')
require('dotenv').config();
const encryptionMiddleware = require('./src/middleware/encryptionMiddleware');

const app = express();

// Enable CORS
app.use(cors());

app.use(bodyParser.json());
app.use(encryptionMiddleware);
app.use('/api/v1', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});