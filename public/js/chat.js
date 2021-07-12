const socket = io();

const sendLocation = document.getElementById("send-location");
const messageForm = document.getElementById("message-form");
const messageFormInput = document.getElementById("message-form").children[0];
const messageFormButton = document.getElementById("message-form").children[1];
const messages = document.getElementById("messages");

const messageTemplate = document.getElementById("message-template").innerHTML;
const locationMessageTemplate = document.getElementById("location-message-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
 const newMessage = messages.lastElementChild;

 const newMessageStyles = getComputedStyle(newMessage);
 const newMessageMargin = parseInt(newMessageStyles.marginBottom);
 const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

 const visibleHeight = messages.offsetHeight;
 const containerHeight = messages.scrollHeight;
 const scrollOffset = messages.scrollTop + visibleHeight;

 if (containerHeight - newMessageHeight <= scrollOffset) {
  messages.scrollTop = messages.scrollHeight;
 }
};

socket.on("message", ({text, username, createdAt}) => {
 const html = Mustache.render(messageTemplate, {message: text, username, createdAt: moment(createdAt).format("h:mm A")});

 messages.insertAdjacentHTML("beforeend", html);
 autoscroll();
});

socket.on("locationMessage", ({url, username, createdAt}) => {
 const html = Mustache.render(locationMessageTemplate, {url, username, createdAt: moment(createdAt).format("h:mm A")});
 
 messages.insertAdjacentHTML("beforeend", html);
 autoscroll();
});

socket.on("roomData", ({room, users}) => {
 const html = Mustache.render(sidebarTemplate, {room, users});
 
 document.getElementById("sidebar").innerHTML = html;
});

messageForm.addEventListener("submit", e => {
 e.preventDefault();
 messageFormButton.setAttribute("disabled", "true")

 const messageText = e.target.elements.message.value;

 socket.emit("sendMessage", messageText, error => {
  messageFormButton.removeAttribute("disabled");
  messageFormInput.value = "";
  messageFormInput.focus();
  
  return error ? console.error(error) : console.log("Message Sent!")
 });
});

sendLocation.addEventListener("click", () => {
 if (!navigator.geolocation) return alert("Geolocation is not supported by your browser.");
 sendLocation.setAttribute("disabled", "true")

 navigator.geolocation.getCurrentPosition(position => socket.emit("sendLocation", {
  latitude: position.coords.latitude,
  longitude: position.coords.longitude
 }, () => {
  sendLocation.removeAttribute("disabled");
  
  console.log("Location Shared!")
 }));
});

socket.emit("join", {username, room}, err => {
 if (err) {
  alert(err);
  location.href = "/";
 }
});