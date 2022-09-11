/**
 * Handles Websocket connection
*/

var Socket;

// Socket API
var API = new function() {

    // Sends a message to the server
    this.sendMessage = (message) => {
        Socket.send(JSON.stringify({
            type: 'message',
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

// Authenticate and fetch logged in user details
User.fetchUser().then(data => {

    // Set Username and PFP in UI
    _('User.username').innerHTML = data.username;
    _('User.pfp').style.background = `url('https://avatars.dicebear.com/api/identicon/${encodeURIComponent(data.username)}.svg')`;

    // Connect to the server
    Socket = new WebSocket(WS_SERVER_URL + '/' + User.token);

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

}).catch(e => {
    
    // Failed to authenticate / fetch details from token
    // Log out

    User.logOut();

});