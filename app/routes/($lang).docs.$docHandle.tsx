import { LoaderArgs } from '@shopify/remix-oxygen';
import { json } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { getMarkdownToHTML } from '~/lib/markdown';

  // .docs {
  //   h1 {
  //     @apply text-2xl font-black py-1
  //   }
  //   h2 {
  //     @apply text-lg font-semibold uppercase py-1
  //   }
  //   h3 {
  //     @apply text-lg font-medium uppercase py-1
  //   }
  //   img {
  //     @apply py-1
  //   }
  //   p {
  //     @apply text-copy  py-1
  //   }
  //   ul {
  //     @apply text-copy list-disc px-6 py-1
  //   }
  // }
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
  const __html = getMarkdownToHTML('/docs/markdown/' + docHandle + '.md')

  return (
    <>
      <div className="flex flex-auto justify-center">
        <div className="max-w-5xl px-4 docs" dangerouslySetInnerHTML={{ __html }} ></div>
      </div>
    </>
  );
}

