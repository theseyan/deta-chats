/**
 * Authentication middleware
*/

var config = require('../config.json');
var api = require('./api');

var openRoutes = [
    "/users/login",
    "/users/signup",
    "/ws",
    "/users/user"
];

module.exports.middleware = (req, res, next) => {
    var openRoute = false;
    openRoutes.forEach((route) => {
        if(req.url.startsWith(route) == true) {
            openRoute = true;
            next();
        }
    });

    // Do not proceed if the route does not need auth
    if(openRoute === true) return;

    if(!req.headers.authorization) {
        return res.status(401).type('json').send(JSON.stringify({
            message: "Authentication token missing or invalid"
        }));
    }else {
        api.authenticateToken(req.headers.authorization.split(" ")[1]).then(data => {
            next();
        }).catch(e => {
            return res.status(401).type('json').send(JSON.stringify({
                message: "Failed to verify authentication token"
            }));
        });
    }
};