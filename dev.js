/**
 * Utility script used for development
*/

require('./app/index').listen({
    port: 8080
}).then(() => {
    console.log(`Server listening on port 8080`);
});

require('./server/server');