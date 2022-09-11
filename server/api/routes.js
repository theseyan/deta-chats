const config = require('../config.json');
const fs = require('fs');
const path = require('path');
var auth = require('./auth').middleware;

module.exports = {

    setup: (app) => {

        // Authentication middleware
        app.use(auth);

        // Load all endpoints from /endpoints folder
        const endpoints = fs.readdirSync(path.join(__dirname, 'endpoints')).filter(file => file.endsWith('.js'));

        for (const file of endpoints) {
            const endpoint = require(`./endpoints/${file}`);

            // Register the API endpoint
            app[endpoint.type](endpoint.route, endpoint.handle);
        }

        // Base route
        app.get('/', (req, res) => {
            res.send('Deta Chats Websocket Server');
        });

    }

};