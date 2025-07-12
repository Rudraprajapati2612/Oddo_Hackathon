// File: src/ws/index.ts
import { WebSocketServer } from 'ws';
import http from 'http';

import type { WebSocket } from 'ws';

const clients = new Map<string, WebSocket>();


export const setupWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const params = new URLSearchParams(req.url?.split('?')[1]);
    const userId = params.get('userId');

    if (userId) {
      clients.set(userId, ws);
    }

    ws.on('close', () => {
      if (userId) clients.delete(userId);
    });
  });
};

export const sendNotification = (userId: string, notification: any) => {
  const ws = clients.get(userId);
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type: 'notification', data: notification }));
  }
};
