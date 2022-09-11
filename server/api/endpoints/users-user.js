/**
 * User Login API route
*/

const api = require('../api');

module.exports = {

    type: 'post',
    route: '/users/user',

    handle: async (req, res) => {
        var body = await req.json();
        if(body.token) {

            // Get details from token
            api.authenticateToken(body.token).then(data => {
                res.status(200).type('json').send(JSON.stringify({
                    id: data.id,
                    username: data.username
                }));
            }).catch(e => {
                res.status(500).send(e.message);
            });

        }else {
            res.status(400).send("Malformed request");
        }
    }

};