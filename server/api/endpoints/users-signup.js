/**
 * User Sign Up API route
*/

const api = require('../api');

module.exports = {

    type: 'post',
    route: '/users/signup',

    handle: async (req, res) => {
        var body = await req.json();

        if(body.username && body.password && body.captcha) {

            // Verify reCAPTCHA
            try {await api.verifyCaptcha(body.captcha, req.ip)}
            catch(e) {
                return res.status(400).send("Could not verify captcha token");
            }

            // Create user
            api.createUser(body.username, body.password, req.ip).then(() => {
                res.status(200).type('json').send(JSON.stringify({
                    message: 'User created successfully'
                }));
            }).catch(e => {
                res.status(500).send(e.message);
            });

        }else {
            res.status(400).send("Malformed request");
        }
    }

};