const path = require("path");
const http = require("http");
const express = require("express");
// require时实际返回了一个function
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
	generateMessage,
	generateLocationMessage
} = require("./utils/messages");
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
// 使用socketio function to configure socketio to work with a given server
// 注意这里的socketio只能接收http server所以我们上面使用http module创建server
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

// print a message when a new client connects
io.on("connection", socket => {
	console.log("server connection!");

	// client sends username and room, and server makes that user to join
	// listener for join
	socket.on("join", (options, callback) => {
		// 要不返回username要不返回id
        const { error, user } = addUser({ id: socket.id, ...options});
		if (error) {
			// 有错误call callback with error
			return callback(error);
        }
        console.log(user);
		// Join a room, 只能在server使用
		// 有room概念后给了我们新的一种发送event的形式，就是发送event到特定room
		socket.join(user.room);
		// Emit message in the same room
		socket.emit("message", generateMessage("Welcome!"));

		socket.broadcast
			.to(user.room)
			.emit("message", generateMessage(`${user.username} has joined!`));
		// 一切顺利调用callback
		callback();
	});

	// Server listen for sendMessage event
	socket.on("sendMessage", (messageInput, callback) => {
		const filter = new Filter();
		if (filter.isProfane(messageInput)) {
			// setup the server to send back acknowledgement and will not emit message event because of the error
			return callback("Profanity is not allowed!");
		}

		// send messages to all connected client
		io.to("testroom").emit("message", generateMessage(messageInput));

		// setup the server to send back acknowledgement
		callback();
	});

	// listen for sendLocation event
	socket.on("sendLocation", ({ latitude, longitude }, callback) => {
		// When fired, send an event with url to all connected clients
		io.emit(
			"locationMessage",
			generateLocationMessage(
				`https://google.com/maps?q=${latitude},${longitude}`
			)
		);
		// setup the server to send back acknowledgement
		callback();
	});

	// send a message when a client get disconnected
	socket.on("disconnect", () => {
		// remove user after disconnecting, result will be a removed user or undefined
		const user = removeUser(socket.id);
		// If there is a real user being removed
		if (user) {
			io.to(user.room).emit(
				"message",
				generateMessage(`${user.username} has left ${user.room}`)
			);
		}
	});
});

server.listen(port, () => {
	console.log("Server Connected to port ", port);
});
