"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const matter_1 = require("@project-chip/matter");
// Initialize the Matter Client
const client = new matter_1.MatterClient();
// Setup WebSocket server
const wss = new ws_1.WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => {
        console.log('Received:', message);
    });
    ws.send('Connected to WebSocket server');
});
// Connect to the Matter device
function connectToMatterDevice() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Replace with the actual IP address or device identifier
            const device = yield client.connectToDevice('192.168.1.100'); // IP address of the Matter lamp
            console.log('Connected to the Matter device!');
            // Turn on the lamp (assuming the lamp exposes a "power" characteristic)
            yield device.sendCommand('power', { state: 'on' });
            console.log('Lamp turned on!');
            // Send response to WebSocket clients
            wss.clients.forEach((client) => {
                if (client.readyState === 1) {
                    client.send('Lamp has been turned on!');
                }
            });
        }
        catch (error) {
            console.error('Error connecting to the Matter device:', error);
        }
    });
}
// Start the connection
connectToMatterDevice();
