const uws = require('uWebSockets.js');
const config = require('./config.json');
const randomstring = require("randomstring");
const api = require('./api/api');
const escaper = require('html-escaper');
const apiRoutes = require('./api/routes');
const hyperExpress = require('hyper-express');
const cors = require('cors');
const limiter = require('./limiter');

var app = new hyperExpress.Server();

// Use CORS
app.use(cors());

// Handle upgrading to Websocket connection
app.upgrade('/ws/:token', async (request, response) => {
    if(!request.path_parameters['token']) return response.status(400).send('Authentication token missing');

    // Check if IP address is banned
    if(global.BannedIPs[request.ip]) {
        return response.status(401).send('IP address is banned');
    }

    // Authenticate token
    const token = request.path_parameters.token;

    api.authenticateToken(token).then(data => {
        // Upgrade the incoming request with user data
        response.upgrade({
            id: data.id,
            username: data.username
        });
    }).catch(e => {
        response.status(401).send('Authentication token invalid/unauthorized');
    });
});

// Websocket Server
app.ws('/ws/:token', {
    // Disconnect users after one hour of idling
    idleTimeout: 60 * 60,
}, (ws) => {
    
    ws.limiter = new limiter(ws);

    // Join global room
    ws.subscribe('global');

    ws.on('message', async (message) => {

        // Do not process message if we are being rate limited
        if(ws.rateLimited && ws.rateLimited == true) return;

        var payload = JSON.parse(message);
        if(!payload.type) return;

        // Handle messages
        if(payload.type == 'message') {
            // Return if empty message
            if(payload.message == '') return;

            // Sanitize & escape message fields
            payload.message = escaper.escape(payload.message);
            payload.username = ws.context.username;

            // Save message to database
            await api.addMessage(ws.context.username, payload.message);

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
        
    });

});

// Register API endpoints
apiRoutes.setup(app);

// Listen on all interfaces
app.listen('0.0.0.0', config.websocket.port).then(listenSocket => {

    if (listenSocket) {
        console.log('Websocket server listening to port ' + config.websocket.port);
    }

}).catch(e => {
    throw e;
});