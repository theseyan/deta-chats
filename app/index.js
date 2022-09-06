/**
 * Deta Chats (https://chats.deta.dev)
 * @author Sayan J. Das
*/

const app = require('fastify').default();
const path = require('path');
const fstatic = require('@fastify/static');

// Register static directory
app.register(fstatic, {
    root: path.join(__dirname, 'static'),
});

// app.get('/', async (request, reply) => {
//     return { hello: 'world' }
// });

module.exports = app;