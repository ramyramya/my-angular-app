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
const knex = require('./src/mysql/knex');
const userSockets = new Map(); // Store user ID to socket mapping

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
// // Socket.IO setup
// io.on('connection', (socket) => {
//   console.log('a user connected');

//   socket.on('join', (userId) => {
//     socket.join("myroom");
//     console.log(`User ${userId} joined room myroom`);
//   });
  
//   socket.on('chat message', (msg) => {
//     console.log(`Message from ${msg.sender}: ${msg.text}`);
//     io.to("myroom").emit('chat message', msg);
//     //socket.broadcast.emit('chat message', msg);
//   });
  
//   socket.on('disconnect', () => {
//     console.log(`User disconnected`);
//   });
  
// });




// io.on('connection', (socket) => {
//     console.log(`🟢 New user connected: ${socket.id}`);

//     // Handle user joining their personal room
//     socket.on('join', (userId) => {
//         socket.join(userId); // Join room with userID as name
//         userSockets.set(userId, socket.id); // Always update the socket ID

//         console.log(`👥 User ${userId} joined room ${userId}`);
//         console.log(`📌 Updated userSockets:`, userSockets);
//     });

//     socket.on('chat message', (msg) => {
//       console.log(`📨 Message from ${msg.senderId} to ${msg.receiverId}: ${msg.text}`);
  
//       const receiverSocketId = userSockets.get(msg.receiverId);
//       console.log(`🔍 Stored socket ID for User ${msg.receiverId}: ${receiverSocketId}`);
      
//       console.log("🟢 Active sockets:", [...io.sockets.sockets.keys()]); // Logs all connected sockets
  
//       if (receiverSocketId && io.sockets.sockets.has(receiverSocketId)) {
//           io.to(receiverSocketId).emit('chat message', msg);
//           console.log(`✅ Message sent to User ${msg.receiverId}`);
//       } else {
//           console.log(`⚠️ User ${msg.receiverId} is not connected or has an outdated socket.`);
//       }
//   });
  

//     // Handle disconnection
//     socket.on('disconnect', () => {
//         console.log(`🔴 User disconnected: ${socket.id}`);
        
//         // Remove disconnected socket from userSockets
//         for (const [userId, socketId] of userSockets.entries()) {
//             if (socketId === socket.id) {
//                 userSockets.delete(userId);
//                 console.log(`❌ Removed User ${userId} from active connections.`);
//                 break;
//             }
//         }
//     });
// });



io.on('connection', (socket) => {
    console.log(`🟢 New user connected: ${socket.id}`);

    socket.on('join', (userId) => {
      // Ensure userId is a string and remove extra spaces
      const userIdString = String(userId).trim();
  
      socket.join(userIdString); // Join room with userId as name
      userSockets.set(userIdString, socket.id); // Store the socket ID in the map
  
      console.log(`👥 User ${userIdString} joined room ${userIdString}`);
      console.log(`📌 Updated userSockets:`, userSockets);
  });
  
  socket.on('chat message', (msg) => {
      console.log(`📨 Message from ${msg.senderId} to ${msg.receiverId}: ${msg.text}`);
  
      // Ensure receiverId is a string and remove extra spaces
      const receiverIdString = String(msg.receiverId).trim();
      console.log('Receiver ID:', receiverIdString, 'Keys in map:', [...userSockets.keys()]);
  
      // Access the socket ID for the receiver
      const receiverSocketId = userSockets.get(receiverIdString);
      console.log(`🔍 Stored socket ID for User ${receiverIdString}: ${receiverSocketId}`);
  
      if (receiverSocketId) {
          if (io.sockets.sockets.has(receiverSocketId)) {
              io.to(receiverSocketId).emit('chat message', msg);
              console.log(`✅ Message sent to User ${receiverIdString}`);
          } else {
              console.log(`⚠️ User ${receiverIdString} socket does not exist in active connections.`);
          }
      } else {
          console.log(`⚠️ Socket ID for User ${receiverIdString} is not stored in the map.`);
      }
  });
  

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`🔴 User disconnected: ${socket.id}`);

        // Remove the user from the userSockets map when they disconnect
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                console.log(`❌ Removed User ${userId} from active connections.`);
                break;
            }
        }
    });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});