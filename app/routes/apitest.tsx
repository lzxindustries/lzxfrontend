import { LoaderArgs } from "@shopify/remix-oxygen";
import { useLoaderData } from "@remix-run/react";
import { getDataCollection } from "~/lib/db.common.server";
import { Remarkable } from 'remarkable';
import { useEffect, useState } from "react";
//import raw from "raw.macro";
//const markdown = raw("../../public/docs/beginner-patches.md");


export async function loader({ context }: LoaderArgs) {

  const modules = await getDataCollection(context, "Module");
  const patches = await getDataCollection(context, "Patch");

  return {
    patches
  };
};

export function getMarkdownToHTML(url: string) {
  const [markdownString, setMarkdownString] = useState('');
  useEffect(() => {
    fetch('/docs/beginner-patches.md')
      .then((response) => response.text())
      .then((text) => {
        setMarkdownString(text);
      });
  }, []);

  const markdownRenderer = new Remarkable();
  const response = markdownRenderer.render(markdownString)
  return response
}

export default function APITest() {
  const { patches } = useLoaderData();
  const __html = getMarkdownToHTML('/docs/beginner-patches.md')

  return (
    <div dangerouslySetInnerHTML={{ __html }} />
  );
}