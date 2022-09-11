/**
 * Implements rate-limiting for messages
 * and a few other limits
*/

const api = require('./api/api');

const MAX_CONN_PER_IP = 2;
const MPS_PER_IP = 4;
const MAX_RATE_VIOLATIONS = 5;

var WsConnections = [];
var WsMessageRate = [];
var WsRateViolations = [];
global.BannedIPs = [];

var LimiterInterval = setInterval(() => {
    for(var ip in WsMessageRate) {
        if(WsMessageRate[ip].rate > MPS_PER_IP && WsRateViolations[ip] >= MAX_RATE_VIOLATIONS) {
            // Disconnect and ban
            WsMessageRate[ip].ws.close();
            global.BannedIPs[ip] = true;

            // Delete message history
            api.deleteHistory(WsMessageRate[ip].ws.context.username);

            console.log(`Banned ${ip}`);
        }else if(WsMessageRate[ip].rate > MPS_PER_IP) {
            WsRateViolations[ip]++;
        }

        // Reset rate
        WsMessageRate[ip].rate = 0;
    }
}, 1000);

module.exports = function (ws) {

    this.ip = ws.ip;

    // Max 2 WebSocket connections per IP
    if(WsConnections[this.ip] && WsConnections[this.ip] >= MAX_CONN_PER_IP) return ws.close();
    else if(WsConnections[this.ip]) WsConnections[this.ip]++;
    else WsConnections[this.ip] = 1;

    WsMessageRate[this.ip] = {
        rate: 0,
        ws: ws
    };
    WsRateViolations[this.ip] = 0;

    ws.on('message', (message) => {
        ws.rateLimited = false;
        WsMessageRate[this.ip].rate++;

        if(WsMessageRate[this.ip].rate > MPS_PER_IP) {
            // Flag connection as being rate limited
            ws.rateLimited = true;
        }
    });

    ws.on('close', () => {
        WsConnections[this.ip]--;
    });

};