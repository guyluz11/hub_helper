
// TODO: Ask About logger
import { Logger } from "@matter/main";
import {MatterAPI} from './integrations/matter/matter_integration';

const logger = Logger.get("Controller");


const matterAPI = new MatterAPI();

matterAPI.start()
    .then(() => console.log("Matter API initialized and running"))
    .catch(error => console.error("Error initializing Matter API:", error));

// TODO: For new device    
matterAPI.commissionDevice("127.0.0.1", 5540, "MT:Y.K9042C00KA0648G00")
.then(() => console.log("Commission device"))
.catch(error => console.error("Error Commission:", error));

const nodeIdN = 123;

// TODO: Get info of device by device id 
matterAPI.getDeviceInfo(nodeIdN)
.then((info: string) => console.log("deviceInfo " + info))
.catch(error => console.error("Error Commission:", error));

// TODO: Set device state 
matterAPI.setDeviceOnOff(nodeIdN, true)
.then(() => console.log("Change device state"))
.catch(error => console.error("Error Commission:", error));


// TODO: Listen for changes
matterAPI.listenForChanges(nodeIdN)
.then(() => console.log("Change device state"))
.catch(error => console.error("Error Commission:", error));

