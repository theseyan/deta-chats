const {Deta} = require('deta');
const ulid = require('./ulid');
const config = require('../config.json');
const escaper = require('html-escaper');
const bcrypt = require('bcrypt');
const uuid = require('uuid').v4;
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const privateKey = fs.readFileSync(path.join(__dirname, `../keys`, config.api.keys.privateKey));

const deta = Deta(config.api.keys.deta);
const db = deta.Base("deta-chats");
const usersdb = deta.Base("deta-chats-users");
const userlimitdb = deta.Base("deta-chats-user-limit");

module.exports = new function() {

    // Registers a user to database
    this.createUser = (username, password, ip) => {
        return new Promise((resolve, reject) => {
            username = escaper.escape(username);
            const id = uuid();

            // Validate input
            if(username.length > 50 || username.length < 1 || password.length < 3 || password.length > 50) {
                return reject(new Error('Invalid username/password provided'));
            }

            // Check if IP address hasn't been used to create an account in the last 24 hours
            userlimitdb.get(ip).then(ipRes => {

                if(ipRes != null) return reject(new Error('This IP address was used to create an account in the last 24 hours. Please try again later.'));

                // Check if username already exists
                usersdb.fetch({"username": username}).then(result => {
                    if(result.count > 0) return reject(new Error("Username already exists"));

                    // Hash password
                    bcrypt.hash(password, 10, function(err, hash) {
                        if(err) return reject(new Error('Failed to hash password'));
        
                        // Add item to database
                        usersdb.put({
                            username: username,
                            password_hash: hash,
                            createdAt: String(Math.round(Date.now() / 1000))
                        }, id).then(resolve).catch(reject);

                        // Add IP address to user limits
                        // Each record expires in 24 hours
                        userlimitdb.put({
                            ip: ip
                        }, ip, {expireIn: 24 * 60 * 60}).catch(e => {
                            console.log('Failed to add IP address to user limits: ' + e);
                        });
                    });
                }).catch(reject);

            }).catch(reject);
        });
    };

    // Authenticates a user and returns a JWT
    this.loginUser = async (data, cb) => {
        data.username = escaper.escape(data.username);
        var users = await usersdb.fetch({"username": data.username}, {limit: 1});
        var user = users.items[0];

        // Throw if user doesn't exist
        if(users.count < 1) throw new Error('Username does not exist');

        // Verify password against hash
        if(bcrypt.compareSync(data.password, user.password_hash) === true) {
            const token = jwt.sign({ sub: user.username, id: user.key }, privateKey, { expiresIn: '60d' });

            return token;
        }else {
            throw new Error('Wrong password for given username');
        }
    };

    // Verifies a gRecaptcha v2 token
    this.verifyCaptcha = (token, ip) => {
        return new Promise((resolve, reject) => {
            fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                body: {
                    secret: config.api.keys.grecaptchaSecret,
                    response: token,
                    remoteip: ip
                }
            }).then(async response => {

                if(!response.ok) return reject(new Error("Network request to verify reCAPTCHA token failed"));
                var body = await response.json();

                resolve(body.success);

            }).catch(e => {
                reject(new Error("Network request to verify reCAPTCHA token failed"));
            });
        });
    };

    // Authenticates a JWT token
    this.authenticateToken = (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, privateKey, function(err, decoded) {
                if(err) return reject(new Error("Invalid JWT token"));

                return resolve({id: decoded.id, username: decoded.sub});
            });
        });
    };

    // Deletes a list of messages with IDs
    this.deleteMessages = async (ids) => {
        for(var i=0; i<=ids.length-1; i++) {
            await db.delete(ids[i]);
        }
    };

    // Deletes all previous messages of user
    this.deleteHistory = (username) => {
        var items = [];
        db.fetch({username: username}).then(result => {
            for(var i=0; i<=result.items.length-1; i++) {
                items.push(result.items[i].key);
            }

            this.deleteMessages(items).then(() => {
                if(result.last) {
                    // More items are to be deleted
                    this.deleteHistory(username);
                }else {
                    console.log('Deleted history for ' + username);
                }
            }).catch(e => {
                console.log('Failed to delete history: ', e);
            });
        }).catch(e => {
            console.log('Failed to delete history: ', e);
        });
    };
    
    // Adds a message to chats database
    this.addMessage = (username, message) => {
        // We reverse the timestamp to lexicographically sort the messages in descending order of time
        const id = ulid.ulid(ulid.TIME_MAX - Date.now());

        return db.put({
            username: username,
            message: message,
            createdAt: String(Math.round(Date.now() / 1000))
        }, id);
    };

    // Fetch latest messages upto a specified limit
    this.getMessages = (limit) => {
        return db.fetch({}, {
            limit: limit
        });
    };

};