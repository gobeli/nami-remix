import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData, json, Link } from "remix";


// https://remix.run/api/conventions#meta
export let meta: MetaFunction = () => {
  return {
    title: "Remix Starter",
    description: "Welcome to remix!"
  };
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  return (
    <div className="remix__page">
      <main>
        <h2>Welcome to Nami-Remix!</h2>
        <p>Checkout the <Link to="/account/login">auth</Link>
        </p>
      </main>
    </div>
  );
}
