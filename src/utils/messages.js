const generateMessage = (text, username) => ({text, username, createdAt: new Date().getTime()});
const generateLocationMessage = (url, username) => ({url, username, createdAt: new Date().getTime()});

module.exports = {generateMessage, generateLocationMessage};