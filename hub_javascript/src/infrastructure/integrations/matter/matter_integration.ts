import { Environment, StorageService, Time } from "@matter/main";
import { BasicInformationCluster, GeneralCommissioning, OnOff } from "@matter/main/clusters";
import { ManualPairingCodeCodec, QrPairingCodeCodec, NodeId } from "@matter/main/types";
import { CommissioningController, NodeCommissioningOptions } from "@project-chip/matter.js";
import { NodeStates } from "@project-chip/matter.js/device";
import { loggerService} from "../../services/logger_service";
import { EntityActions } from "../../../domain/from_dart/request_action_types";
import { RequestActionObject } from "../../../domain/from_dart/request_action_object";
import { DeviceEntityNotAbstract } from "../../../domain/from_dart/device_entity_base";


// type CommissioningOptions = {
//     ip: string;
//     port: number;
//     pairingCode: string;
// };

export class MatterAPI {
    static _instance: any;
    private environment = Environment.default;
    private  storageService = this.environment.get(StorageService);
    private commissioningController!: CommissioningController;
  

    constructor() {
        if (MatterAPI._instance) {
          return MatterAPI._instance
        }
        MatterAPI._instance = this;
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
        loggerService.log("Matter API started");
    }

    async commissionDevice( pairingCode: string) : Promise<NodeId> {
        const nodeOptions = this.createCommissioningOptions(pairingCode);
        loggerService.log(`Commissioning... ${JSON.stringify(nodeOptions)}`);
        const nodeId = await this.commissioningController.commissionNode(nodeOptions);
        loggerService.log(`Commissioning completed with nodeId ${nodeId}`);
        return nodeId;
    }

    private createCommissioningOptions(pairingCode: string): NodeCommissioningOptions {

        let re = new RegExp("MT:.*");
        let pcData;
        let manualPairing;
        if (re.test(pairingCode)) {
            pcData = QrPairingCodeCodec.decode(pairingCode)[0];
        } else {
            manualPairing = ManualPairingCodeCodec.decode(pairingCode);
            pcData = manualPairing;
        }
        
        return {
            commissioning: {
                regulatoryLocation: GeneralCommissioning.RegulatoryLocationType.IndoorOutdoor,
                regulatoryCountryCode: "XX",
            },
            discovery: {
                identifierData:
                    pcData.discriminator !== undefined
                    ? { longDiscriminator : pcData.discriminator }
                    : manualPairing?.shortDiscriminator !== undefined
                      ? { shortDiscriminator :  manualPairing.shortDiscriminator }
                      : {},
                discoveryCapabilities: {
                    ble : false,
                },
            },
            passcode: pcData.passcode,
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
            loggerService.log(`Attribute changed: ${path.nodeId}/${path.clusterId}/${path.attributeName} -> ${value}`);
        });
        conn.events.stateChanged.on(state => {
            loggerService.log(`State changed: ${NodeStates[state]}`);
        });
    }

    async setStateByAction(requestAction: RequestActionObject){
        if(requestAction.actionType === EntityActions.On){
            requestAction.entityIds.forEach(async (id) => {
              const numericId = BigInt(id);
              await this.setDeviceOnOff(numericId, true);
            });
          }
          if(requestAction.actionType === EntityActions.Off){
            requestAction.entityIds.forEach(async (id) => {
              const numericId = BigInt(id);
              await this.setDeviceOnOff(numericId, false);
            });
          }
    }


    async getEntitiesForId(id: NodeId ) : Promise<DeviceEntityNotAbstract[]> {

        
        return [];
    }
}


export const matterAPI = new MatterAPI();
