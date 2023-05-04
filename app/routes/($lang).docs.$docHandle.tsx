import {
  Section
} from '~/components';
import { LoaderArgs } from '@shopify/remix-oxygen';
import { json } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import { getMarkdownToHTML } from '~/lib/markdown';

export async function loader({params, request, context}: LoaderArgs) {
  const {docHandle} = params;
  return json(
    {
      docHandle
    }
  );
}

export default function GettingStarted() {
  const {docHandle} = useLoaderData<typeof loader>();
  const __html = getMarkdownToHTML('/docs/' + docHandle + '.md')
  
  return (
    <>
      <Section>
        <div dangerouslySetInnerHTML={{ __html }} ></div>
      </Section>
    </>
  );
}

