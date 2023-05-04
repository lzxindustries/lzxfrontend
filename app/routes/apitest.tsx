import { LoaderArgs } from "@shopify/remix-oxygen";
import { useLoaderData } from "@remix-run/react";
import { getDataCollection } from "~/lib/db.common.server";

export async function loader({ context }: LoaderArgs) {

  const modules = await getDataCollection(context, "Module");
  const patches = await getDataCollection(context, "Patch");

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