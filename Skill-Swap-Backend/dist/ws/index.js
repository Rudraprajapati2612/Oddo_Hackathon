"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.setupWebSocketServer = void 0;
// File: src/ws/index.ts
const ws_1 = require("ws");
const clients = new Map();
const setupWebSocketServer = (server) => {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on('connection', (ws, req) => {
        var _a;
        const params = new URLSearchParams((_a = req.url) === null || _a === void 0 ? void 0 : _a.split('?')[1]);
        const userId = params.get('userId');
        if (userId) {
            clients.set(userId, ws);
        }
        ws.on('close', () => {
            if (userId)
                clients.delete(userId);
        });
    });
};
exports.setupWebSocketServer = setupWebSocketServer;
const sendNotification = (userId, notification) => {
    const ws = clients.get(userId);
    if (ws && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'notification', data: notification }));
    }
};
exports.sendNotification = sendNotification;
