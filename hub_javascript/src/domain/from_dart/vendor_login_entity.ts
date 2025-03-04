import { VendorsAndServices } from "./request_action_types";

export class VendorLoginEntity {
    vendor: VendorsAndServices;
    apiKey?: string;
    authToken?: string;
    pairingCode?: string;
    email?: string;
    password?: string;
    ip?: string;
    port?: string;
    static event: string = 'setUpDevice';

    
    constructor(
        vendor: VendorsAndServices,
        options?: {
            apiKey?: string;
            authToken?: string;
            pairingCode?: string;
            email?: string;
            password?: string;
            ip?: string;
            port?: string;
        }
    ) {
        this.vendor = vendor;
        this.apiKey = options?.apiKey;
        this.authToken = options?.authToken;
        this.pairingCode = options?.pairingCode;
        this.email = options?.email;
        this.password = options?.password;
        this.ip = options?.ip;
        this.port = options?.port;
    }

    static fromJson(json: any): VendorLoginEntity {
        return new VendorLoginEntity(json.vendor, {
            apiKey: json.apiKey,
            authToken: json.authToken,
            pairingCode: json.pairingCode,
            email: json.email,
            password: json.password,
            ip: json.ip,
            port: json.port,
        });
    }
}
