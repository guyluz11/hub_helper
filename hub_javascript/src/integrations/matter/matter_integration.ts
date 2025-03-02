import { Environment, Logger, StorageService, StorageContext, Time } from "@matter/main";
import { BasicInformationCluster, DescriptorCluster, GeneralCommissioning, OnOff } from "@matter/main/clusters";
import { ControllerCommissioningFlowOptions } from "@matter/main/protocol";
import { QrPairingCodeCodec, NodeId } from "@matter/main/types";
import { CommissioningController, NodeCommissioningOptions } from "@project-chip/matter.js";
import { NodeStates } from "@project-chip/matter.js/device";

type CommissioningOptions = {
    ip: string;
    port: number;
    pairingCode: string;
};

export class MatterAPI {
    private logger = Logger.get("MatterAPI");
    private environment = Environment.default;
    private  storageService = this.environment.get(StorageService);
    private commissioningController!: CommissioningController;
    // private  controllerStorage : StorageContext | undefined;

    constructor() {
    }

    async start() {
        const controllerStorage = (await this.storageService.open("controller")).createContext("data");

        const uniqueId = (await controllerStorage.has("uniqueid"))
            ? await controllerStorage.get<string>("uniqueid")
            : (this.environment.vars.string("uniqueid") ?? Time.nowMs().toString());
        await controllerStorage.set("uniqueid", uniqueId);


        this. commissioningController = new CommissioningController({
            environment: {
                environment: this.environment,
                id: uniqueId ??   Time.nowMs().toString(),
            },
            autoConnect: true,
        });

        await this.commissioningController.start();
        this.logger.info("Matter API started");
    }

    async commissionDevice( ip:string, port: number, pairingCode: string) : Promise<NodeId> {
        const options: CommissioningOptions = {
            ip: ip,  
            port: port,        
            pairingCode: pairingCode, 
        };
    
        const nodeOptions = this.createCommissioningOptions(options);
        this.logger.info(`Commissioning... ${JSON.stringify(nodeOptions)}`);
        const nodeId = await this.commissioningController.commissionNode(nodeOptions);
        this.logger.info(`Commissioning completed with nodeId ${nodeId}`);
        return nodeId;
    }

    private createCommissioningOptions(options: CommissioningOptions): NodeCommissioningOptions {
        const { ip, port, pairingCode } = options;
        const pairingCodeCodec = QrPairingCodeCodec.decode(pairingCode)[0];
        const setupPin = pairingCodeCodec.passcode;
        const longDiscriminator = pairingCodeCodec.discriminator;

        return {
            commissioning: {
                regulatoryLocation: GeneralCommissioning.RegulatoryLocationType.IndoorOutdoor,
                regulatoryCountryCode: "XX",
            },
            discovery: {
                knownAddress: { ip, port, type: "udp" },
                identifierData: { longDiscriminator },
            },
            passcode: setupPin,
        };
    }


    async getCommissioneDevices(){
       return this.commissioningController.getCommissionedNodes()
    }


    async getDeviceInfo(nodeIdN: bigint | number): Promise<string> {
        const conn = await this.commissioningController.connectNode(NodeId(nodeIdN));
        const info = conn.getRootClusterClient(BasicInformationCluster);
        return info ? await info.getProductNameAttribute() : "No BasicInformation Cluster found";
    }

    async setDeviceOnOff(nodeIdN: bigint | number, state: boolean) {
        const conn = await this.commissioningController.connectNode(NodeId(nodeIdN));
        const device = conn.getDevices()[0];
        const onOff = device?.getClusterClient(OnOff.Complete);
        if (onOff) {
            return state ? await onOff.on() : await onOff.off();
        }
        throw new Error("OnOff cluster not found");
    }

    async listenForChanges(nodeIdN: bigint | number) {
        const conn = await this.commissioningController.connectNode(NodeId(nodeIdN));
        conn.events.attributeChanged.on(({ path, value }) => {
            this.logger.info(`Attribute changed: ${path.nodeId}/${path.clusterId}/${path.attributeName} -> ${value}`);
        });
        conn.events.stateChanged.on(state => {
            this.logger.info(`State changed: ${NodeStates[state]}`);
        });
    }
}


