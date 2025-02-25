import { WebSocketServer } from 'ws';
import { MatterClient } from '@project-chip/matter.js';
import { ChipDeviceController } from '@matter/main';

// Initialize the Matter Client
const client = new ChipDeviceController();

// Setup WebSocket server
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');

    ws.on('message', (message) => {
        console.log('Received message:', message.toString());
    });

    // Send a welcome message when the WebSocket connects
    ws.send('Connected to WebSocket server');
});

// Function to connect to the Matter device
async function connectToMatterDevice() {
    try {
        // Initialize Matter Client (replace with actual device details)
        const device = await client.connectToDevice({
            deviceName: 'MatterLamp', // Use your device's name or ID
            ipAddress: '192.168.1.100', // Replace with the device's IP
        });

        console.log('Connected to the Matter device!');

        // Send a command to turn on the lamp (assuming device supports power characteristic)
        await device.sendCommand('power', { state: 'on' });

        console.log('Lamp turned on!');

        // Broadcast to all WebSocket clients that the lamp is turned on
        wss.clients.forEach((client) => {
            if (client.readyState === 1) { // Only send to open connections
                client.send('Lamp has been turned on!');
            }
        });
    } catch (error) {
        console.error('Error connecting to the Matter device:', error);
    }
}

// Start the connection to Matter device
connectToMatterDevice();
