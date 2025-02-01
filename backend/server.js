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
const rateLimit = require('express-rate-limit');


//const dashboardService = require('./src/v1/dashboard/dashboard.service');

const app = express();
const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Ensure this is correct, especially if your frontend is hosted on a different port/domain
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type"],
//   },
 
// });
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true
  },
  transports: ['websocket', 'polling'] 
});

// Define rate limit: 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: "Too many requests, please try again later." },
  headers: true, 
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
app.use(apiLimiter);

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

// Start the background worker
require('./src/backgroundWorker')(io, userSockets);
io.on('connection', (socket) => {
    console.log(`🟢 New user connected: ${socket.id}`);

    socket.on('join', async(userId) => {
      // Ensure userId is a string and remove extra spaces
      const userIdString = String(userId).trim();
  
      socket.join(userIdString); // Join room with userId as name
      userSockets.set(userIdString, socket.id); // Store the socket ID in the map
  
      console.log(`👥 User ${userIdString} joined room ${userIdString}`);
      console.log(`📌 Updated userSockets:`, userSockets);
      // Mark user as active in the database
    await knex("users").where("id", Number(userIdString)).update({ is_active: true });

    // Broadcast updated active users list
    emitActiveUsers();
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
              
                // // If receiver is offline, save the message in the database with "unread" status
                // this.dashboardService.saveMessageToDatabase(msg.senderId, msg.receiverId, msg.text, false); // "false" indicates unread
                // console.log(`⚠️ User ${msg.receiverId} is offline. Message saved in the database.`);
              
          }
      } else {
          console.log(`⚠️ Socket ID for User ${receiverIdString} is not stored in the map.`);
      }
  });
  
//   socket.on('chat message', async (msg) => {
//     console.log(`📨 Message from ${msg.senderId} to ${msg.receiverId}: ${msg.text}`);

//     const senderIdString = String(msg.senderId).trim();
//     const receiverIdString = String(msg.receiverId).trim();

//     // Check if the sender is active in the database
//     const sender = await knex("users").where("id", Number(senderIdString)).select("is_active").first();

//     if (!sender || !sender.is_active) {
//         console.log(`⚠️ Blocked message from inactive user ${senderIdString}`);
//         return;  // Block the message and don't proceed further
//     }

//     console.log('Receiver ID:', receiverIdString, 'Keys in map:', [...userSockets.keys()]);

//     // Access the socket ID for the receiver
//     const receiverSocketId = userSockets.get(receiverIdString);
//     console.log(`🔍 Stored socket ID for User ${receiverIdString}: ${receiverSocketId}`);
    
//     if (receiverSocketId) {
//         if (io.sockets.sockets.has(receiverSocketId)) {
//             io.to(receiverSocketId).emit('chat message', msg);
//             console.log(`✅ Message sent to User ${receiverIdString}`);
//         } else {
//             console.log(`⚠️ User ${receiverIdString} socket does not exist in active connections.`);
            
//             // If receiver is offline, save the message in the database with "unread" status
//             // this.dashboardService.saveMessageToDatabase(msg.senderId, msg.receiverId, msg.text, false); // "false" indicates unread
//             // console.log(`⚠️ User ${msg.receiverId} is offline. Message saved in the database.`);
//         }
//     } else {
//         console.log(`⚠️ Socket ID for User ${receiverIdString} is not stored in the map.`);
//     }
// });

  // socket.on('leave', async (userId) => {
  //   const userIdString = String(userId).trim();
  //   const socketId = userSockets.get(userIdString);

  //   if (socketId) {
  //     socket.leave(userIdString);
  //     userSockets.delete(userIdString);
  //     console.log(`❌ User ${userIdString} left the chat.`);

  //     await knex("users").where("id", Number(userIdString)).update({ is_active: false });

  //     //socket.disconnect(true);
  //     emitActiveUsers();

  //     const userSocket = io.sockets.sockets.get(socketId); // Get the socket by ID
  //   if (userSocket) {
  //     userSocket.disconnect(true); // Disconnect only the specific user
  //     console.log(`❌ User ${userIdString} has been disconnected.`);
  //   }

  //   emitActiveUsers();
  //   }
  // });

    // Handle disconnection
    socket.on('disconnect', async() => {
        console.log(`🔴 User disconnected: ${socket.id}`);
        let disconnectedUserId = null;
        // Remove the user from the userSockets map when they disconnect
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
              disconnectedUserId = userId;
                userSockets.delete(userId);
                console.log(`❌ Removed User ${userId} from active connections.`);
                break;
            }
        }
        if (disconnectedUserId) {
          await knex("users").where("id", Number(disconnectedUserId)).update({ is_active: false });
          console.log(`❌ User ${disconnectedUserId} marked as inactive.`);
    
          // Broadcast updated active users list
          emitActiveUsers();
        }

        
    
    });


    function emitActiveUsers() {
      knex("users")
        .where("is_active", true)
        .select("id", "username", "thumbnail")
        .then((users) => {
          io.emit("activeUsers", users);
        });
    }
});






const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});





