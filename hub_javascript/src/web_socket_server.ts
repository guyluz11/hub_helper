// import { WebSocketServer } from 'ws';


// // Initialize the Matter Client
// const client = new ChipDeviceController();

// // Setup WebSocket server
// const wss = new WebSocketServer({ port: 8080 });

// wss.on('connection', (ws) => {
//     console.log('New WebSocket client connected');

//     ws.on('message', (message) => {
//         console.log('Received message:', message.toString());
//     });

//     // Send a welcome message when the WebSocket connects
//     ws.send('Connected to WebSocket server');
// });