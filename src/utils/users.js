let users = [];

const addUser = ({id, username, room}) => {
 username = username.trim();
 username = username.trim().toLowerCase();

 if (!(username && room)) return {error: "Username and room are required!"};

 const existingUser = users.find(user => user.username === username && user.room === room);

 if (existingUser) return {error: "Username is in use!"};

 const user = {id, username, room};
 users.push(user);
 
 return {user};
};

const removeUser = id => {
 const user = users.find(user => user.id === id);
 users = users.filter(user => user.id !== id);

 return user;
};

const getUser = id => users.find(user => user.id === id);
const getUsersInRoom = room => users.filter(user => user.room === room.trim().toLowerCase());

module.exports = {
 addUser,
 removeUser,
 getUser,
 getUsersInRoom
};