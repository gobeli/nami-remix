import { useState, useEffect } from "react";
import { Outlet } from "remix";

// export let action: ActionFunction = async ({ request }) => {
//   const data = await request.formData();
//   const address = bech32AddressFromHex(data.get('address') as string);

//   return redirect(`/account/${address}`);
// }

export default function Account() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    checkEnabled();
  }, []); 
  
  const checkEnabled = async () => {
    setEnabled(await window.cardano.isEnabled());    
  }

  const onConnect = async () => {
    setEnabled(await window.cardano.enable());
  }

  if (!enabled) {
    return (
      <>
        <p>Your wallet is not connected.</p>
        <button onClick={onConnect}>Connect now!</button>
      </>
    )
  }

  return <Outlet />
}