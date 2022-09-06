/**
 * Handles Websocket connection
*/

// Replace with Websocket server URL
const WS_SERVER_URL = 'wss://deta-chats.fly.dev';
//const WS_SERVER_URL = 'ws://localhost:9001';

// Connect to the server
const Socket = new WebSocket(WS_SERVER_URL);

// Socket API
var API = new function() {

    // Sends a message to the server
    this.sendMessage = (username, message) => {
        Socket.send(JSON.stringify({
            type: 'message',
            username: username,
            message: message
        }));
    };

    // Fetches latest messages from server
    this.fetchMessages = () => {
        Socket.send(JSON.stringify({
            type: 'history'
        }));
    };

};

// Connection opened
Socket.addEventListener('open', (event) => {
    console.log('Connected to Websocket server!');

    // Load history
    API.fetchMessages();
});

// Listen for messages
Socket.addEventListener('message', (event) => {
    var message = JSON.parse(event.data);

    if(message.type == 'message') {
        // Add the message to chats box
        Chats.addMessage(message.username, message.message);
    }
    else if(message.type == 'history') {
        // Render history messages
        message.messages.reverse();
        Chats.box.innerHTML = '';
        Chats.renderMessages(message.messages);
    }
});

// Handle close event
Socket.addEventListener('close', (event) => {
    alert('Connection to the server was closed.');
});

// Handle error event
Socket.addEventListener('error', (err) => {
    alert('A Websocket error occured: ' + err);
});