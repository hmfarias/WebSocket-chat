import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';

//import routers
import viewsRouter from './routes/views.router.js';

// import the server constructor from socket.io
import { Server } from 'socket.io';

// create a new instance of the express application
const app = express();

// bring PORT from the environment variables or use 8080 as default
const PORT = process.env.PORT || 8080;

//Configure the handlebars template engine
app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

//define the 'public' folder where static files are
app.use(express.static(`${__dirname}/public`));

//implement the routes
app.use('/', viewsRouter);

//create the server http
const httpServer = app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// create the socket.io server inside the http server
const io = new Server(httpServer);

// create an array to store the messages
const messages = [];

// START WORKING WITH SOCKET.IO ****************************************************
// define the event listener for the connection event in the socket.io server
// here we are listening for all the messages that are sent from the client
io.on('connection', (socket) => {
	console.log(`New client connected with id ${socket.id}`);
	let username = null; // Store username for later use

	// listen for the message event emited from the client
	socket.on('message', (data) => {
		console.log(`Message received: ${data}`);
		messages.push(data); //add the message to the messages array for log purposes
		// re emit the messages array to all the clients
		io.emit('newMessage', data);
	});

	//NEW USER CONNECTED
	// emit a message to all the clients EXCEPT the CURRENT ONE, about the new user connected
	// Receive the username from the client
	socket.on('userConnected', (user) => {
		console.log(`User connected: ${user}`);
		username = user; // Save username in the socket session

		// Broadcast to all other clients that a new user has joined
		socket.broadcast.emit('newUserConnected', user);

		// only for the current client recently connected, emit a message with the messages array showing the previous messages sent
		socket.emit('previousMessages', messages);
	});

	// USER DISCONNECTED
	// emit a message to all the clients EXCEPT the CURRENT ONE, about the  user disconnected
	socket.on('disconnect', () => {
		console.log(`User disconnected: ${username}`);
		socket.broadcast.emit('userDisconnected', username);
	});
});
