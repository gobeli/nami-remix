import { Address, PublicKey, BaseAddress, StakeCredential, RewardAddress, Ed25519Signature } from "@emurgo/cardano-serialization-lib-nodejs";
import { COSESign1, Label } from "../../message-signing/rust/pkg/emurgo_message_signing";
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

export type ApiError = {
  status_code: number;
  message: string;
  error: string;
};

export type WithApiError<T> = T & ApiError;

export function bech32AddressFromHex(address: string) {
  return Address.from_bytes(Buffer.from(address, 'hex')).to_bech32();
}

export function hexAddressFromBech32(address: string) {
  return Buffer.from(Address.from_bech32(address).to_bytes()).toString('hex');
}


const verifyPayload = (payload: string, payloadCose: Uint8Array) => {
  return Buffer.from(payloadCose).compare(Buffer.from(payload, 'hex'));
};

const verifyAddress = (address: string, addressCose: Address, publicKeyCose: PublicKey) => {
  const checkAddress = Address.from_bytes(Buffer.from(address, 'hex'));
  if (addressCose.to_bech32() !== checkAddress.to_bech32()) return false;

  // check if BaseAddress
  try {
    const baseAddress = BaseAddress.from_address(addressCose);
    
    //reconstruct address
    const paymentKeyHash = publicKeyCose.hash();
    const stakeKeyHash = baseAddress?.stake_cred().to_keyhash();

    const reconstructedAddress = BaseAddress.new(
      checkAddress.network_id(),
      StakeCredential.from_keyhash(paymentKeyHash),
      StakeCredential.from_keyhash(stakeKeyHash)
    );
    return checkAddress.to_bech32() === reconstructedAddress.to_address().to_bech32()
  } catch (e) {}

  // check if RewardAddress
  try {
    //reconstruct address
    const stakeKeyHash = publicKeyCose.hash();
    const reconstructedAddress = RewardAddress.new(
      checkAddress.network_id(),
      StakeCredential.from_keyhash(stakeKeyHash)
    );
    return checkAddress.to_bech32() === reconstructedAddress.to_address().to_bech32()
  } catch (e) {}
  return false;
}

/**
 * All values are HEX encoded
 */
 export interface VerifyRequest {
  address: string;
  signature: string;
  payload: string;
}

export const verify = (requestData: VerifyRequest) => {
  const coseSign1 = COSESign1.from_bytes(Buffer.from(requestData.signature, 'hex'));
  const payloadCose = coseSign1.payload();

  if (!payloadCose)
    throw new Error('No payload found');


  if (verifyPayload(requestData.payload, payloadCose))
    throw new Error('Payload does not match');


  const protectedHeaders = coseSign1
    .headers()
    .protected()
    .deserialized_headers();

  const addressCose = Address.from_bytes(
    protectedHeaders.header(Label.new_text('address')).as_bytes()
  );
  const publicKeyCose = PublicKey.from_bytes(protectedHeaders.key_id());

  if (!verifyAddress(requestData.address, addressCose, publicKeyCose))
    throw new Error('Could not verify because of address mismatch');

  
  const signature = Ed25519Signature.from_bytes(coseSign1.signature());
  const data = coseSign1.signed_data().to_bytes();
  return publicKeyCose.verify(data, signature);
}

export class API {
  private static api: BlockFrostAPI;

  static get instance() {
    if (!this.api) {
      this.api = new BlockFrostAPI({ projectId: process.env.BLOCKRFORST_KEY as string });
    }
    return this.api;
  }
}
