import { ActionFunction, LoaderFunction, redirect, useSubmit,  } from "remix";
import { bech32AddressFromHex, verify, VerifyRequest } from "~/util/cardano.server";
import { toHex } from "~/util/cardano";
import { createUserSession, getUserId } from "~/util/session.server";

export let loader: LoaderFunction = async ({ request }) => {
  const session = await getUserId(request);
  if (session) {
    return redirect('/account/profile');
  }
  return null;
}

export let action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const verifyRequest: VerifyRequest = {
    address: formData.get('address')?.toString() ?? '',
    payload: formData.get('payload')?.toString() ?? '',
    signature: formData.get('signature')?.toString() ?? ''
  }
  
  const success = verify(verifyRequest);

  if (!success) {
    return { success, message: 'Verification failed!' }
  }

  return createUserSession(bech32AddressFromHex(verifyRequest.address), '/account/profile');
}

export default function Account() {
  const submit = useSubmit();

  const login = async () => {
    const addresses = await cardano.getUsedAddresses();
    const address = addresses[0];
    const payload = toHex('test');

    const signature = await window.cardano.signData(address, payload);

    submit({ 
      address,
      signature,
      payload
    }, { method: 'post' });
  }

  return (
    <button onClick={login}>Login</button>
  )
}