import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
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
} as const


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
  create_item: ({name, quantity, price, description}: {name: string, quantity: u64, price: u64, description: string}, options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a delete_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  delete_item: ({id}: {id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_inventory transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_inventory: (options?: MethodOptions) => Promise<AssembledTransaction<Array<InventoryItem>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAADUludmVudG9yeUl0ZW0AAAAAAAAFAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXByaWNlAAAAAAAABgAAAAAAAAAIcXVhbnRpdHkAAAAG",
        "AAAAAAAAAAAAAAALY3JlYXRlX2l0ZW0AAAAABAAAAAAAAAAEbmFtZQAAABAAAAAAAAAACHF1YW50aXR5AAAABgAAAAAAAAAFcHJpY2UAAAAAAAAGAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAQAAABA=",
        "AAAAAAAAAAAAAAALZGVsZXRlX2l0ZW0AAAAAAQAAAAAAAAACaWQAAAAAAAYAAAABAAAAEA==",
        "AAAAAAAAAAAAAAANZ2V0X2ludmVudG9yeQAAAAAAAAAAAAABAAAD6gAAB9AAAAANSW52ZW50b3J5SXRlbQAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    create_item: this.txFromJSON<string>,
        delete_item: this.txFromJSON<string>,
        get_inventory: this.txFromJSON<Array<InventoryItem>>
  }
}