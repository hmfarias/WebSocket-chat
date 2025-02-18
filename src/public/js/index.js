// CLIENT SIDE

//instance the socket.io client and save it in a variable called io. This socket will be used to connect and send messages to the server from the client side
const socket = io();

//Creation of DOM elements and auxiliary variables
let user; //It is the name entered by the user when he/she logs in.
let chatBox = document.getElementById('chatBox'); //reference to the box in which the messages are entered
let messageLog = document.getElementById('messageLog'); //reference to the container in which the messages are displayed

//Auth Alert
Swal.fire({
	title: 'Identify yourself',
	input: 'text', //user needs to type something in the input box to continue
	text: 'Enter the user name to identify yourself in the chat',
	allowOutsideClick: false, // avoid user go outside the modal
	inputValidator: (value) => {
		if (!value) return 'Please enter your username!'; // avoids proceeding if the user has not entered the user name
	},
}).then((result) => {
	user = result.value; //assign in the variable user the value entered by the user in the box
	// Send the username to the server after connecting
	document.getElementById('usernameDisplay').textContent = `Hola, ${user}`; //show the username in te page
	socket.emit('userConnected', user);
});

//Listen for the key event on the send message button
chatBox.addEventListener('keyup', (event) => {
	if (event.key === 'Enter') {
		// Check if the message is empty or undefined
		if (chatBox.value.trim()) {
			socket.emit('message', { user: user, message: chatBox.value }); //Emit the message and the user
			chatBox.value = '';
		}
	}
});

// MESSAGES SENT IN THE CHAT
// listen for the message event re emited from the server
socket.on('newMessage', (message) => {
	//show the message in the clients browser
	uploadMessage(message);
});

//NEW USER CONNECTED
// listen for the message event emited from the server about a new user connected
socket.on('newUserConnected', (user) => {
	//show an alert in the clients browser
	Swal.fire({
		title: 'New user connected',
		text: `User ${user} connected`,
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000,
		timerProgressBar: true,
		icon: 'info',
	});
	//show the message in the clients browser
	uploadMessage({ user: user, message: 'Is now connected!' }, 'green');
});

//USER DISCONNECTED
// listen for the message event emited from the server about a user disconnected
socket.on('userDisconnected', (user) => {
	//show an alert in the clients browser
	Swal.fire({
		title: 'User disconnected',
		text: `User ${user} disconnected`,
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 5000,
		timerProgressBar: true,
		icon: 'info',
	});
	//show the message in the clients browser
	uploadMessage({ user, message: 'Disconnected' }, 'red');
});

///-----------------------------------------------------------------------------------

// PREVIOUS MESSAGES
// listen and show the previosmessages sent from the server
socket.on('previousMessages', (messages) => {
	//show the message in the clients browser
	messages.forEach((message) => {
		uploadMessage(message);
	});
});

//function to upload the message in the clients browser
const uploadMessage = (message, defaultColor = 'black') => {
	// Check if the message is empty or undefined
	if (!message || !message.message.trim()) return;

	const messageElement = document.createElement('p');

	// If the message is from the current user itself, change the color
	const isOwnMessage = message.user === user;
	const messageColor = isOwnMessage ? 'blue' : defaultColor;
	const senderName = isOwnMessage ? 'YOU' : message.user;

	// Set the message styles
	messageElement.innerText = `${senderName}: ${message.message}`;
	messageElement.style.color = messageColor;
	messageElement.style.fontWeight = isOwnMessage ? 'bold' : 'normal';
	messageElement.style.margin = '2.5px 0'; // Reduce vertical margin

	//append the message to the messageLog
	messageLog.appendChild(messageElement);
};
