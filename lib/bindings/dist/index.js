import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CAJVFVM4DT6ZR634PU3MRFGP5FHDE5AAHCZXR4F54KWKZV25YQ7LYB2Z",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAADUludmVudG9yeUl0ZW0AAAAAAAAFAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXByaWNlAAAAAAAABgAAAAAAAAAIcXVhbnRpdHkAAAAG",
            "AAAAAAAAAAAAAAALY3JlYXRlX2l0ZW0AAAAABAAAAAAAAAAEbmFtZQAAABAAAAAAAAAACHF1YW50aXR5AAAABgAAAAAAAAAFcHJpY2UAAAAAAAAGAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAQAAABA=",
            "AAAAAAAAAAAAAAALZGVsZXRlX2l0ZW0AAAAAAQAAAAAAAAACaWQAAAAAAAYAAAABAAAAEA==",
            "AAAAAAAAAAAAAAANZ2V0X2ludmVudG9yeQAAAAAAAAAAAAABAAAD6gAAB9AAAAANSW52ZW50b3J5SXRlbQAAAA=="]), options);
        this.options = options;
    }
    fromJSON = {
        create_item: (this.txFromJSON),
        delete_item: (this.txFromJSON),
        get_inventory: (this.txFromJSON)
    };
}
