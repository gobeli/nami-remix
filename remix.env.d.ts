/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />


/**
 * hex encoded cbor string
 */
 type Value = string;

 /**
  * hex encoded cbor string
  */
  type Transaction = string;
 
 /**
  * hex encoded cbor string
  */
 type TransactionWitnessSet = string;
 
 /**
  * hex encoded bytes string
  */
 type CoseSign1 = string;
 
 /**
  * hex encoded bytes string
  */
 type TransactionUnspentOutput = string;
 
 /**
  * hex encoded hash32 string
  */
 type hash32 = string;
 
 type BaseAddress = string;
 
 type RewardAddress = string;
 
 interface Paginate {
   page: number;
   limit: number;
 }
 
 interface Cardano {
   enable: () => Promise<boolean>;
   isEnabled: () => Promise<boolean>;
   getBalance: () => Promise<Value>;
   signData: (aaddress: BaseAddress | RewardAddress, payload: string) => Promise<CoseSign1>;
   signTx: (tx: Transaction, partialSign?: boolean) => Promise<TransactionWitnessSet>;
   submitTx: (tx : Transaction) => hash32;
   getUtxos: (amount?: Value, paginage?: Paginate) => Promise<TransactionUnspentOutput[]>;
   getCollateral: () => Promise<TransactionUnspentOutput>;
   getUsedAddresses: () => Promise<BaseAddress[]>;
   getUnusedAddresses: () => Promise<BaseAddress[]>;
   getChangeAddress: () => Promise<BaseAddress>;
   getRewardAddress: () => Promise<RewardAddress>;
   getNetworkId: () => Promise<number>;
   onAccountChange: (cb: (addresses : BaseAddress[]) => void) => void;
   onNetworkChange: (cb: (network : number) => void) => void;
 }

 declare module "cardano" {
  global {
    const cardano: Cardano;
    interface Window {
      cardano: Cardano
    }
  }
  export = cardano;
}