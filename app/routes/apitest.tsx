import { LoaderArgs } from "@shopify/remix-oxygen";
import { useLoaderData } from "@remix-run/react";
import { getDatabaseCollection } from "~/lib/db.server";

export async function loader({ context }: LoaderArgs) {

  const modules = await getDatabaseCollection(context, "Module");
  const patches = await getDatabaseCollection(context, "Patch");

  return {
    patches
  };
};

export default function APITest() {
  const { patches } = useLoaderData();

  return (
    <div>
      {JSON.stringify(patches)}
    </div>
  );
}