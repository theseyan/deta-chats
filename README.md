> [!CAUTION]
> This project is no longer maintained and likely does not work with the latest versions of Deta Cloud. It was originally written for Deta Space's code marathon and to demonstrate the possibility of a realtime, persisted live chat application running on fully free services.

# Deta Chats

A simple Chat app built using vanilla HTML5, CSS3 and Javascript that runs on Deta & Fly.io, completely free!

## Hierarchy
- `/app` contains the client/frontend which is hosted on a Deta Micro. Run with `node app/index.js`.
- `/server` contains the websocket and API backend which is hosted on Fly.io. Run with `node server/server.js`.
- `dev.js` is a Node.js script used for rapid development. Starts both the client and server processes.
