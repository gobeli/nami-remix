const S = require('@emurgo/cardano-serialization-lib-nodejs'); //serialization-lib: https://github.com/Emurgo/cardano-serialization-lib
const MS = require('./message-signing/rust/pkg/emurgo_message_signing'); //message-signing: https://github.com/Emurgo/message-signing/blob/master/examples/rust/src/main.rs

// Example runs in Node.js (to verify in a browser, the libraries need to be imported asynchronously)

/**
 *
 * @param {string} address - hex encoded
 * @param {string} payload - hex encoded
 * @param {string} coseSign1Hex - hex encoded
 */
const verify = (address, payload, coseSign1Hex) => {
  const coseSign1 = MS.COSESign1.from_bytes(Buffer.from(coseSign1Hex, 'hex'));
  const payloadCose = coseSign1.payload();

  if (verifyPayload(payload, payloadCose))
    throw new Error('Payload does not match');

  const protectedHeaders = coseSign1
    .headers()
    .protected()
    .deserialized_headers();
  const addressCose = S.Address.from_bytes(
    protectedHeaders.header(MS.Label.new_text('address')).as_bytes()
  );
  const publicKeyCose = S.PublicKey.from_bytes(protectedHeaders.key_id());

  if (!verifyAddress(address, addressCose, publicKeyCose))
    throw new Error('Could not verify because of address mismatch');

  const signature = S.Ed25519Signature.from_bytes(coseSign1.signature());
  const data = coseSign1.signed_data().to_bytes();
  return publicKeyCose.verify(data, signature);
};

const verifyPayload = (payload, payloadCose) => {
  return Buffer.from(payloadCose, 'hex').compare(Buffer.from(payload, 'hex'));
};

const verifyAddress = (address, addressCose, publicKeyCose) => {
  const checkAddress = S.Address.from_bytes(Buffer.from(address, 'hex'));
  if (addressCose.to_bech32() !== checkAddress.to_bech32()) return false;
  // check if BaseAddress
  try {
    const baseAddress = S.BaseAddress.from_address(addressCose);
    //reconstruct address
    const paymentKeyHash = publicKeyCose.hash();
    const stakeKeyHash = baseAddress.stake_cred().to_keyhash();
    const reconstructedAddress = S.BaseAddress.new(
      checkAddress.network_id(),
      S.StakeCredential.from_keyhash(paymentKeyHash),
      S.StakeCredential.from_keyhash(stakeKeyHash)
    );
    if (
      checkAddress.to_bech32() !== reconstructedAddress.to_address().to_bech32()
    )
      return false;

    return true;
  } catch (e) {}
  // check if RewardAddress
  try {
    //reconstruct address
    const stakeKeyHash = publicKeyCose.hash();
    const reconstructedAddress = S.RewardAddress.new(
      checkAddress.network_id(),
      S.StakeCredential.from_keyhash(stakeKeyHash)
    );
    if (
      checkAddress.to_bech32() !== reconstructedAddress.to_address().to_bech32()
    )
      return false;

    return true;
  } catch (e) {}
  return false;
};


console.log(verify("0139395d3f5666389e62fe9e99f71ab9d5d4f4467827570f1c927cc1047c1efd29f3ced3f65da5344510cf1425c18ec5327566fb37e4bdcb27", "74657374", "845869a301270458206d4999e267ce3c29eff27190c6987f3104f514339d87265bb8e1e71d49730bf3676164647265737358390139395d3f5666389e62fe9e99f71ab9d5d4f4467827570f1c927cc1047c1efd29f3ced3f65da5344510cf1425c18ec5327566fb37e4bdcb27a166686173686564f444746573745840163849d00a688f495aadaa95a46520dad7c8dead4a8179852c97516c7f607a150bee47bbb8584452e519ef73d0453f0a3cdf0108e7490b91062b4998c8cbf809"));