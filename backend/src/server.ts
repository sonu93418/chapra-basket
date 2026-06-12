import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { attachRealtimeServer } from './realtime/socket.js';

const app = createApp();
const server = http.createServer(app);

attachRealtimeServer(server);

server.listen(env.port, () => {
  console.log(`Blink Box API running on http://localhost:${env.port}`);
});
