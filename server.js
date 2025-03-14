
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
const PORT = process.env.PORT || 5000;
let users = {};

//user icons 
const userIcons = [
  "🐱", "🐶", "🐵", "🦊", "🐻", "🐼", "🐸", "🐯", "🐷", "🐧",
  "🐔", "🐢", "🐙", "🐞", "🦄", "🐝", "🐍", "🦋", "🦀", "🐠",
  "🐳", "🦉", "🐺", "🐰", "🐭", "🐨", "🦓", "🦒", "🦘", "🦛",
  "🦏", "🐎", "🐿", "🦔", "🐩", "🐕", "🐈", "🦜", "🦢", "🦚"
];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    
    // Assign a random username and icon
    const username = `User-${Math.floor(Math.random() * 1000)}`;
    const icon = userIcons[Math.floor(Math.random() * userIcons.length)];

    users[socket.id] = { room, username, icon };

    // Notify others that the user joined
    io.to(room).emit("message", {
      user: "System",
      text: `${icon} ${username} joined the chat`,
    });
  });

  socket.on("sendMessage", ({ room, message }) => {
    const user = users[socket.id];
    if (user) {
      io.to(room).emit("message", { user: `${user.icon} ${user.username}`, text: message });
    }
  });

  socket.on("typing", (room) => {
    const user = users[socket.id];
    if (user) {
      socket.to(room).emit("typing", `${user.icon} ${user.username} is typing...`);
    }
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      io.to(users[socket.id].room).emit("message", {
        user: "System",
        text: `${users[socket.id].icon} ${users[socket.id].username} left the chat`,
      });
      delete users[socket.id];
    }
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
