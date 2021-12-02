import { Responses } from "@blockfrost/blockfrost-js";
import { LoaderFunction, redirect, useLoaderData } from "remix";
import { lovelaceToAda } from "~/util/cardano";
import { API, WithApiError } from "~/util/cardano.server";
import { getUserId } from "~/util/session.server";

type Asset = { policy: string, name: string, quantity: number };
type LoaderData = Responses['address_content'] & { hexAddress: string, assets: Asset[] };

export let loader: LoaderFunction = async ({ request }) => {
  try {
    const address = await getUserId(request);

    if (!address) {
      return redirect('/account/login');
    }
    
    const data = await API.instance.addresses(address);

    const assets = data.amount
      .filter(a => a.unit !== 'lovelace')
      .map(a => {
        const policy = a.unit.slice(0, 56);
        const name = Buffer.from(a.unit.slice(56), 'hex').toString();
        return { policy, name, quantity: +a.quantity }
      });


    return {
      ...data,
      assets
    }
  } catch (err) {
    return err;
  }
}


export default function Profile() {
  let data = useLoaderData<WithApiError<LoaderData>>();

  if (data.error) {
    return (
      <p>{data.message}</p>
    );
  }

  const ada = lovelaceToAda(+data.amount.find(a => a.unit === 'lovelace')?.quantity)

  return (
    <>
      <h1>Account</h1>
      <p>{data.address}</p>
      <ul>
        <li>{ada} Ada</li>
        {data.assets.map(a => <li key={a.policy}>{a.quantity} {a.name}</li>)}
      </ul>
    </>
  )
}