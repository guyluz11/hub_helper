const { Environment, Logger, singleton, StorageService, Time } = require( "@matter/main");
const { BasicInformationCluster, DescriptorCluster, GeneralCommissioning, OnOff } = require( "@matter/main/clusters");
const { ClusterClientObj, ControllerCommissioningFlowOptions } = require("@matter/main/protocol") 
const { ManualPairingCodeCodec, QrPairingCodeCodec, NodeId } = require("@matter/main/types")

//Some parts of the controller are still in the legacy packages
var { CommissioningController, NodeCommissioningOptions } =  require("@project-chip/matter.js")
var { NodeStates } =  require("@project-chip/matter.js/device")


export async function test() {
    // Initialize Matter Environment
    const environment = Environment.default;
    environment.vars.set("mdns.networkInterface", "enp4s0"); // Adjust network interface

    // Set up Storage
    let ss = environment.get(StorageService);
    ss.location = "/home/zrho/Programmes/test"; // Custom storage location
    environment.set(StorageService, ss);
    console.log(`Using storage at: ${ss.location}`);

    // Create the Matter Controller with nodeId
    const controller = new CommissioningController({
        environment: { environment },
        autoConnect: false, // Manual connection
        nodeId: new NodeId(1), // Fix: Provide a valid NodeId
    });

    // Start the Controller
    await controller.start();
    console.log("Matter Controller Started!");

    // Use Manual Pairing Code
    const manualCode = "34970112332"; // Example Matter manual code
    try {
        await controller.commissionWithManualCode(manualCode);
        console.log("Device successfully commissioned!");
    } catch (err) {
        console.error("Commissioning failed:", err);
    }
}
