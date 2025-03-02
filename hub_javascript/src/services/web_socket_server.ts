import WebSocket, { Server } from 'ws';
import { matterAPI } from '../integrations/matter/matter_integration';

const wss = new Server({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  
  // // Send a message to the client
  // ws.send('Welcome to the WebSocket server');
  
  // Listen for messages from the client
  ws.on('setUpDevice', (message: string) => {
    console.log(`Received: ${message}`);
    matterAPI.commissionDevice('test', 111,'test');
  });


  // // Close the WebSocket connection after 10 seconds
  // setTimeout(() => {
  //   ws.send('Closing connection');
  //   ws.close();
  // }, 10000);
});

console.log('WebSocket server is running on ws://localhost:8080');
