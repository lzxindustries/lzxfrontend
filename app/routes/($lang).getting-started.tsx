import { db } from '~/lib/db'
import {
  Section,
  Grid,
  Button,
  Text,
  PageHeader,
  Heading,
  Link,
  Modal
} from '~/components';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';
export const headers = routeHeaders;


export default function GettingStarted() {
  return (
    <>
      <Section>
        <Heading as="h2">Getting Started</Heading>

      </Section>
    </>
  );
}

