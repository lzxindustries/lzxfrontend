import {MarkdownArticle} from '~/components/MarkdownArticle';
import type {MetaFunction} from '@shopify/remix-oxygen';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import content from '../../content/docs/getting-started/learn.md?raw';

export const meta: MetaFunction = () => {
  return [
    {title: 'Learn Video Synthesis | LZX Industries'},
    {
      name: 'description',
      content:
        'Discover what video synthesis is, the concepts behind it, and the standards that define LZX Modular.',
    },
  ];
};

export default function GettingStartedLearn() {
  return (
    <>
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Getting Started', to: '/getting-started'},
          {label: 'Learn Video Synthesis'},
        ]}
      />
      <MarkdownArticle content={content} />
    </>
  );
}
