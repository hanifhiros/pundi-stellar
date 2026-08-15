import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from "@stellar/stellar-sdk/contract";
import type { u64 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CAJVFVM4DT6ZR634PU3MRFGP5FHDE5AAHCZXR4F54KWKZV25YQ7LYB2Z";
    };
};
export interface InventoryItem {
    description: string;
    id: u64;
    name: string;
    price: u64;
    quantity: u64;
}
export interface Client {
    /**
     * Construct and simulate a create_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_item: ({ name, quantity, price, description }: {
        name: string;
        quantity: u64;
        price: u64;
        description: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a delete_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    delete_item: ({ id }: {
        id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a get_inventory transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_inventory: (options?: MethodOptions) => Promise<AssembledTransaction<Array<InventoryItem>>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        create_item: (json: string) => AssembledTransaction<string>;
        delete_item: (json: string) => AssembledTransaction<string>;
        get_inventory: (json: string) => AssembledTransaction<InventoryItem[]>;
    };
}
