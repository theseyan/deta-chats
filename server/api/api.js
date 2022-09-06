const {Deta} = require('deta');
const ulid = require('./ulid');
const config = require('../config.json');

const deta = Deta(config.api.keys.deta);
const db = deta.Base("deta-chats");

module.exports = new function() {

    this.addMessage = (username, message) => {
        // We reverse the timestamp to lexicographically sort the messages in descending order of time
        const id = ulid.ulid(ulid.TIME_MAX - Date.now());

        return db.put({
            username: username,
            message: message,
            createdAt: String(Math.round(Date.now() / 1000))
        }, id);
    };

    this.getMessages = (limit) => {
        return db.fetch({}, {
            limit: limit
        });
    };

};