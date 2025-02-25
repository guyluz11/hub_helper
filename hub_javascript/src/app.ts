
import {pairDevice, turnOnLight, turnOffLight} from './integrations/matter_integration';



// The device's pairing code (replace this with the actual code you have)
const pairingCode = 'MT:Y.K9042C00KA0648G00'; // Replace with your device's pairing code
const deviceId = '8'; // Replace with your device's actual ID

pairDevice(pairingCode).then(() => {
    turnOnLight(deviceId);
    // Or toggle light state
    // turnOffLight(deviceId);
});
