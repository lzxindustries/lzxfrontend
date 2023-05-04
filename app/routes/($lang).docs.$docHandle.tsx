import { LoaderArgs } from '@shopify/remix-oxygen';
import { json } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { getMarkdownToHTML } from '~/lib/markdown';

export async function loader({ params, request, context }: LoaderArgs) {
  const { docHandle } = params;
  return json(
    {
      docHandle
    }
  );
}

export default function DocPage() {
  const { docHandle } = useLoaderData<typeof loader>();
  const __html = getMarkdownToHTML('/docs/' + docHandle + '.md')

  return (
    <>
      <div className="flex flex-auto justify-center">
        <div className="max-w-5xl px-4 docs" dangerouslySetInnerHTML={{ __html }} ></div>
      </div>
    </>
  );
}

