# Deta Chats

A simple Chat app built using vanilla HTML5, CSS3 and Javascript that runs on Deta & Fly.io, completely free!

## Hierarchy
- `/app` contains the client/frontend which is hosted on a Deta Micro. Run with `node app/index.js`.
- `/server` contains the websocket and API backend which is hosted on Fly.io. Run with `node server/server.js`.
- `dev.js` is a Node.js script used for rapid development. Starts both the client and server processes.