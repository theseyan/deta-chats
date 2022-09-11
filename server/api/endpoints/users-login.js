/**
 * User Login API route
*/

const api = require('../api');

module.exports = {

    type: 'post',
    route: '/users/login',

    handle: async (req, res) => {
        var body = await req.json();
        if(body.username && body.password) {

            // Verify reCAPTCHA
            try {await api.verifyCaptcha(body.captcha, req.ip)}
            catch(e) {
                return res.status(400).send("Could not verify captcha token");
            }

            // Authenticate user
            api.loginUser({username: body.username, password: body.password}).then(token => {
                res.status(200).type('json').send(JSON.stringify({
                    message: 'User authenticated successfully',
                    token: token
                }));
            }).catch(e => {
                res.status(500).send(e.message);
            });

        }else {
            res.status(400).send("Malformed request");
        }
    }

};