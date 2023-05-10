import { LoaderArgs } from "@shopify/remix-oxygen";
import { useLoaderData } from "@remix-run/react";
import { getDataCollection } from "~/lib/db.server";
import { getMarkdownToHTML } from "~/lib/markdown";
//import raw from "raw.macro";
//const markdown = raw("../../public/docs/beginner-patches.md");


export async function loader({ context }: LoaderArgs) {

  const modules = await getDataCollection(context, "Module");
  const patches = await getDataCollection(context, "Patch");

  return {
    patches
  };
};

export default function APITest() {
  const { patches } = useLoaderData();
  const __html = getMarkdownToHTML('/docs/beginner-patches.md')

  return (
    <div dangerouslySetInnerHTML={{ __html }} />
  );
}