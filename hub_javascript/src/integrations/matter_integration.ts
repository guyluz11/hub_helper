const { Device, CommissioningController, PairingStatus } = require('@matter/main'); // Check for available imports

// Define types for device and pairing status
type DeviceId = string;
type PairingCode = string;

// Initialize Commissioner (responsible for pairing and interacting with Matter devices)
const commissioner = new CommissioningController();

// Function to pair the device using the pairing code
export async function pairDevice(pairingCode: PairingCode): Promise<void> {
    try {
        console.log('Attempting to pair with the device...');
        const status = await commissioner.pairDevice(pairingCode);

        if (status === PairingStatus.SUCCESS) {
            console.log('Device paired successfully!');
        } else {
            console.error('Pairing failed:', status);
        }
    } catch (error) {
        console.error('Error during pairing:', error);
    }
}

// Function to turn on the light device (if the device supports "onOff" functionality)
export  async function turnOnLight(deviceId: DeviceId): Promise<void> {
    try {
        const device = await commissioner.getDevice(deviceId);

        // Assuming the device supports on/off functionality, this line will turn on the light
        await device.writeAttribute('onOff', 1); // 1 turns on
        console.log('Light turned on');
    } catch (error) {
        console.error('Error turning on light:', error);
    }
}

// Function to turn off the light device
export async function turnOffLight(deviceId: DeviceId): Promise<void> {
    try {
        const device = await commissioner.getDevice(deviceId);

        // Assuming the device supports on/off functionality, this line will turn off the light
        await device.writeAttribute('onOff', 0); // 0 turns off
        console.log('Light turned off');
    } catch (error) {
        console.error('Error turning off light:', error);
    }
}


