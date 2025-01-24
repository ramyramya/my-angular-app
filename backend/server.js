const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./src/v1/routes');
const { Model } = require('./src/mysql/objection')
require('dotenv').config();
const encryptionMiddleware = require('./src/middleware/encryptionMiddleware');
const { swaggerUi, specs } = require('./src/swagger');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to match your frontend URL
    methods: ["GET", "POST"]
  }
});

// Enable CORS
app.use(cors());

app.use(bodyParser.json());
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io/')) {
    return next(); // Pass through for socket.io requests
  }
  else if (req.path.startsWith('/api-docs')) {
    return next();
  }
  encryptionMiddleware(req, res, next);
});

app.use('/api/v1', routes);


// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
io.use((socket, next) => {
  console.log('Socket.IO middleware triggered');
  next();
});
// Socket.IO setup
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join', (userId) => {
    socket.join("myroom");
    console.log(`User ${userId} joined room myroom`);
  });
  
  socket.on('chat message', (msg) => {
    console.log(`Message from ${msg.sender}: ${msg.text}`);
    io.to("myroom").emit('chat message', msg);
    //socket.broadcast.emit('chat message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected`);
  });
  
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});