import {MarkdownArticle} from '~/components/MarkdownArticle';
import type {MetaFunction} from '@shopify/remix-oxygen';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import content from '../../content/docs/getting-started/modular.md?raw';

export const meta: MetaFunction = () => {
  return [
    {title: 'Start with Modular | LZX Industries'},
    {
      name: 'description',
      content:
        'Set up your first eurorack video synthesis system — install modules, connect sync, and create your first patch.',
    },
  ];
};

export default function GettingStartedModular() {
  return (
    <>
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Getting Started', to: '/getting-started'},
          {label: 'Start with Modular'},
        ]}
      />
      <MarkdownArticle content={content} />
    </>
  );
}
