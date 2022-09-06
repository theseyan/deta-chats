const uws = require('uWebSockets.js');
const config = require('./config.json');
const randomstring = require("randomstring");
const api = require('./api/api');
const escaper = require('html-escaper');

uws.App().ws('/*', {

    // Disconnect users after 1 hour of idling
    idleTimeout: 60 * 60,

    open: (ws) => {
        // Set a random ID to this socket
        ws.key = randomstring.generate(10);
        
        // Join to global room
        ws.subscribe('global');
    },

    message: async (ws, message, isBinary) => {

        var payload = JSON.parse(new TextDecoder().decode(message));
        if(!payload.type) return;

        // Handle messages
        if(payload.type == 'message') {
            // Return if empty message
            if(payload.message == '') return;

            // Sanitize & escape message fields
            payload.username = escaper.escape(payload.username);
            payload.message = escaper.escape(payload.message);

            // If username is empty, use random ID as username
            if(payload.username == '') {
                payload.username = `User ${ws.key}`;
            }

            // Save message to database
            await api.addMessage(payload.username, payload.message);

            // Emit message to all connected users
            ws.publish('global', JSON.stringify(payload));
            ws.send(JSON.stringify(payload));

        }

        // Handle history request
        else if(payload.type == 'history') {
            // Get last 20 messages by default
            var messages = (await api.getMessages(20)).items;

            ws.send(JSON.stringify({
                type: 'history',
                messages: messages
            }));
        }
        
    }

}).get('/*', (res, req) => {

    res.writeStatus('200 OK').end('Deta Chats Websocket Server');

}).listen('0.0.0.0', config.websocket.port, (listenSocket) => {

    if (listenSocket) {
        console.log('Websocket server listening to port ' + config.websocket.port);
    }

});