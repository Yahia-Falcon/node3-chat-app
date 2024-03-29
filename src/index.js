const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {generateMessage, generateLocationMessage} = require("./utils/messages");
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const getDirPath = directory => path.join(__dirname, "..", directory);

app.use(express.static(getDirPath("public")));

io.on("connection", socket => {

 socket.on("join", ({username, room}, callback) => {
  const {error, user} = addUser({id: socket.id, username, room});

  if (error) return callback(error);
  
  socket.join(user.room);

  socket.emit("message", generateMessage("Welcome!", "Admin"));
  socket.broadcast.to(user.room).emit("message", generateMessage(`<${user.username} has joined!>`, "Admin"));
  io.to(user.room).emit("roomData", {room: user.room, users: getUsersInRoom(user.room)});

  callback();
 });

 socket.on("sendMessage", (message, callback) => {
  const user = getUser(socket.id);
  io.to(user.room).emit("message", generateMessage(message, user.username));

  callback();
 });

 socket.on("sendLocation", (coords, callback) => {
  const user = getUser(socket.id);
  io.to(user.room).emit("locationMessage", generateLocationMessage(`https://www.google.com/maps?q=${coords.longitude},${coords.latitude}`, user.username));

  callback();
 });

 socket.on("disconnect", () => {
  const user = removeUser(socket.id);

  if (user) {
   io.to(user.room).emit("message", generateMessage(`<${user.username} has left the chat.>`, "Admin"));
   io.to(user.room).emit("roomData", {room: user.room, users: getUsersInRoom(user.room)})
  }
 });
});

server.listen(3000);