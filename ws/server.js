const { WebSocketServer, WebSocket } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

const clients = [];

wss.on('connection', function connection(ws) {
    console.log("new connection");
    const id = clients.length;
    clients.push(ws);

  ws.on('message', function message(data) {
    console.log('received msg from client: %s', data);

    wss.clients.forEach(function forEach(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
  });

  ws.on('error', console.error);
});