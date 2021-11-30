import { Responses } from "@blockfrost/blockfrost-js";
import { LoaderFunction, redirect, useLoaderData } from "remix";
import SmallAddress from "~/components/SmallAddress";
import { API, bech32AddressFromHex, WithApiError } from "~/util/cardano.server";
import { getUserId } from "~/util/session.server";

type LoaderData = Responses['address_content'] & { hexAddress: string };

export let loader: LoaderFunction = async ({ request }) => {
  try {
    const address = await getUserId(request);

    if (!address) {
      return redirect('/account/login');
    }
    
    const data = await API.instance.addresses(bech32AddressFromHex(address));

    return {
      ...data,
      hexAddress: address
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

  return (
    <SmallAddress value={data.address} />
  )
}