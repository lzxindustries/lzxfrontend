import {useLoaderData, useRouteError, isRouteErrorResponse} from '@remix-run/react';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import ModalImage from 'react-modal-image';
import {Grid} from '~/components/Grid';
import {Section, Text} from '~/components/Text';
import {getAllPatches} from '~/controllers/get_all_patches';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.data}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';
  return (
    <Section>
      <h1 className="text-xl font-bold">Error loading patches</h1>
      <p>{message}</p>
    </Section>
  );
}

export async function loader({context}: LoaderFunctionArgs) {
  const patchData = await getAllPatches(context);
  return patchData;
}

export default function Patches() {
  const patchData = useLoaderData<typeof loader>();

  return (
    <>
      <Section className="py-0">
        <Grid layout="patches" className="py-0">
          {patchData.map((patch, it) => {
            return (
              <div key={patch.name}>
                <Text size="lead" className="w-full uppercase" color="primary">
                  {patch.name}
                </Text>
                {patch.youtube ? (
                  <iframe
                    className="w-full aspect-video"
                    src={
                      'https://www.youtube.com/embed/' +
                      patch.youtube +
                      '?loop=1'
                    }
                    title={patch.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  ></iframe>
                ) : (
                  ''
                )}

                {patch.gif && !patch.youtube ? (
                  // @ts-expect-error react-modal-image types incompatible with React 18
                  <ModalImage
                    className="opacity-100 w-full align-middle"
                    smallSrcSet={'/clips/' + patch.gif}
                    hideDownload={true}
                    hideZoom={true}
                    small={'/clips/' + patch.gif}
                    large={'/clips/' + patch.gif}
                    alt={patch.name + ' Clip'}
                  />
                ) : (
                  ''
                )}
                <div className="w-full h-2" />
                {patch.artist.name ? (
                  <p>
                    <Text color="primary">Artist </Text>
                    <Text color="subtle">{patch.artist.name}</Text>
                  </p>
                ) : (
                  ''
                )}
                {patch.diagram && (
                  <a
                    href={'/diagrams/' + patch.diagram}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={'/diagrams/' + patch.diagram}
                      alt={patch.name + ' Patch Diagram'}
                    />
                  </a>
                )}
                {patch.notes && (
                  <Text size="fine" color="subtle" format>
                    {patch.notes}
                  </Text>
                )}
              </div>
            );
          })}
        </Grid>
      </Section>
    </>
  );
}
