import type {
  Product,
  Media,
  ExternalVideo,
  MediaImage,
} from '@shopify/hydrogen/storefront-api-types';
import React, {useState, useEffect, useMemo} from 'react';
import {TbRectangleFilled} from 'react-icons/tb';
import {ModuleLegendPanel} from './ModuleLegendPanel';
import ProductMediaGallery, {
  type MediaGalleryItem,
  MediaGalleryItemType,
} from './ProductMediaGallery';
import type {ModuleView} from '~/views/module';

const getLastPathSegment = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    const segments = parsedUrl.pathname
      .split('/')
      .filter((segment) => segment.length > 0);
    return segments.length > 0 ? segments[segments.length - 1] : null;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
};

const getGalleryMedia = (
  product: Product//,
  // moduleData: {
  //   name: string;
  //   videos: {youtube: string; name: string}[];
  // },
): MediaGalleryItem[] => {
  const items: MediaGalleryItem[] = [];
  const seenYoutubeIds = new Set<string>();

  product.media.nodes.forEach((item: Media, index) => {
    if (item.mediaContentType === 'IMAGE') {
      const shopifyImage = item as MediaImage;
      if (!shopifyImage.image) return;
      items.push({
        // name: shopifyImage.image.altText || `${moduleData.name} image`,
        name: shopifyImage.image.altText,
        src: shopifyImage.image.url,
        type: MediaGalleryItemType.IMAGE,
      } as MediaGalleryItem);
    } else if (item.mediaContentType === 'EXTERNAL_VIDEO') {
      const shopifyExternalVideo = item as ExternalVideo;
      const youtubeId = getLastPathSegment(shopifyExternalVideo.embedUrl);
      if (!youtubeId) return;
      if (seenYoutubeIds.has(youtubeId)) return;
      seenYoutubeIds.add(youtubeId);
      items.push({
//        name: `${moduleData.name} video (${shopifyExternalVideo.host})`,
        name: `video (${shopifyExternalVideo.host})`,
        src: shopifyExternalVideo.embedUrl,
        type: MediaGalleryItemType.VIDEO,
      } as MediaGalleryItem);
    }
  });

  // moduleData.videos.forEach((video: any) => {
  //   if (seenYoutubeIds.has(video.youtube.trim())) return;
  //   seenYoutubeIds.add(video.youtube.trim());
  //   items.push({
  //     name: video.name,
  //     src: `https://www.youtube.com/embed/${video.youtube}`,
  //     type: MediaGalleryItemType.VIDEO,
  //   } as MediaGalleryItem);
  // });

  return items;
};

export function ModuleDetails({
  children,
  // moduleData,
  product,
}: {
  children?: React.ReactNode;
  // moduleData: ModuleView;
  product: Product;
}) {
  const [activeRefDes, setActiveRefDes] = useState('');
  let hasMainFeatures = false;
  let hasPatchFeatures = false;
  let hasSystemFeatures = false;
  // moduleData.features.forEach((feature) => {
  //   if (feature.topic === 'Main') hasMainFeatures = true;
  //   if (feature.topic === 'Patch') hasPatchFeatures = true;
  //   if (feature.topic === 'System') hasSystemFeatures = true;
  // });
  // const portraitAspect = moduleData.hp >= 25;
  const portraitAspect = true;

  const media: MediaGalleryItem[] = useMemo(() => {
    return getGalleryMedia(product);
  }, [product]);

  const [screenWidth, setScreenWidth] = useState<number>(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      key="ModuleDetails"
      className="flex flex-wrap flex-row justify-center p-0 m-0"
    >
      <ProductMediaGallery media={media}></ProductMediaGallery>
      <div className="basis-[100%] md:basis-1/2 md:h-screen hiddenScroll md:overflow-y-scroll">
        <div className="flex flex-wrap flex-row px-8">
          <div className="basis-[100%] md:basis-1/2 pb-8">
            <div className="font-sans font-bold text-3xl uppercase">
              {product.title}
            </div>
            {/* <div className="font-sans font-semibold text-base uppercase">
              {moduleData.subtitle}
            </div> */}
          </div>
          <div className="basis-[100%] md:basis-1/2 pb-8">{children}</div>
        </div>
        <article key="ModuleDetailsArticle" className="prose px-8">
          <p dangerouslySetInnerHTML={{__html: product.descriptionHtml}}></p>
          {/* {hasMainFeatures
            ? moduleData.features.map((feature) => {
                return feature.topic == 'Main' ? (
                  <div key={`${moduleData.name}-${feature.name}`}>
                    <h2>
                      <TbRectangleFilled className="inline-block align-middle" />{' '}
                      <span className="align-middle">{feature.name}</span>
                    </h2>
                    <p
                      dangerouslySetInnerHTML={{__html: feature.description}}
                    ></p>
                  </div>
                ) : (
                  ''
                );
              })
            : ''}
          <div className="flex flex-wrap flex-row">
            <div className="basis-[100%] md:basis-1/2">
              {moduleData.hp > 0 && moduleData.mounting_depth_mm > 0 ? (
                <>
                  <h3>Dimensions</h3>
                  <p>
                    {'Width, ' + moduleData.hp + 'HP'}
                    <br />
                    {'Mounting Depth, ' + moduleData.mounting_depth_mm + 'mm'}
                  </p>
                </>
              ) : (
                ''
              )}
            </div>
            <div className="basis-[100%] md:basis-1/2">
              {moduleData.has_rear_video_sync_input !== true &&
              moduleData.has_rear_video_sync_output !== true &&
              moduleData.has_front_video_sync_input !== true &&
              moduleData.has_front_video_sync_output !== true &&
              moduleData.has_eurorack_power_sync_input !== true &&
              moduleData.has_eurorack_power_sync_output !== true &&
              moduleData.has_rear_14_pin_sync_input !== true &&
              moduleData.has_rear_14_pin_sync_output !== true ? (
                ''
              ) : (
                <>
                  <h3>Video Sync</h3>
                  <p>
                    {moduleData.has_rear_video_sync_input == true ? (
                      <>
                        Rear RCA Sync Input Jack
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                    {moduleData.has_rear_video_sync_output == true ? (
                      <>
                        Rear RCA Sync Output Jack
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                    {moduleData.has_front_video_sync_input == true ? (
                      <>
                        Front RCA Sync Input Jack
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                    {moduleData.has_front_video_sync_output == true ? (
                      <>
                        Front RCA Sync Output Jack
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                    {moduleData.has_eurorack_power_sync_input == true ? (
                      <>
                        Rear EuroRack Power Header Sync Input (CV/Gate Bus)
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                    {moduleData.has_eurorack_power_sync_output == true ? (
                      <>
                        Rear EuroRack Power Header Sync Output (CV/Gate Bus)
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                    {moduleData.has_rear_14_pin_sync_input == true ? (
                      <>
                        Rear 14 Pin Header Sync Input
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                    {moduleData.has_rear_14_pin_sync_output == true ? (
                      <>
                        Rear 14 Pin Header Sync Output
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                  </p>
                </>
              )}
            </div>
            <div className={'basis-[100%] md:basis-1/2'}>
              {moduleData.max_pos_12v_ma > 0 ||
              moduleData.max_neg_12v_ma > 0 ? (
                <>
                  <h3>Power Consumption</h3>
                  <p>
                    {moduleData.max_pos_12v_ma !== 0 ? (
                      <>
                        {'+12V @ ' + moduleData.max_pos_12v_ma + 'mA'}
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                    {moduleData.max_neg_12v_ma !== 0 ? (
                      <>
                        {'-12V @ ' + moduleData.max_neg_12v_ma + 'mA'}
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                  </p>
                </>
              ) : (
                ''
              )}
            </div>
            <div className="basis-[100%] md:basis-1/2">
              {moduleData.has_dc_barrel_power_entry == true ||
              moduleData.has_eurorack_power_entry == true ? (
                <>
                  <h3>Power Entry</h3>
                  <p>
                    {moduleData.has_dc_barrel_power_entry == true ? (
                      <>
                        Rear DC Barrel Jack
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                    {moduleData.has_eurorack_power_entry == true ? (
                      <>
                        Rear EuroRack 16 Pin Header
                        <br />
                      </>
                    ) : (
                      ''
                    )}
                  </p>
                </>
              ) : (
                ''
              )}
            </div>
            {moduleData.connectors.length == 0 &&
            moduleData.controls.length == 0 ? (
              ''
            ) : (
              <div
                className={
                  portraitAspect
                    ? 'basis-[100%] z-0'
                    : 'basis-[100%] xl:basis-1/2 z-0'
                }
              >
                <h3>Legend</h3>
                <ModuleLegendPanel
                  moduleData={moduleData}
                  setActiveRefDes={setActiveRefDes}
                  activeRefDes={activeRefDes}
                  pixelsPerHP={
                    portraitAspect ? (screenWidth < 400 ? 6 : 8) : 20
                  }
                />
              </div>
            )}
            {moduleData.connectors.length == 0 &&
            moduleData.controls.length == 0 ? (
              ''
            ) : portraitAspect == false ? (
              <>
                <div className="basis-[100%] xl:basis-1/2">
                  {moduleData.connectors.length > 0 ? (
                    <h3>Connectors</h3>
                  ) : null}
                  <p>
                    {moduleData.connectors.length > 0
                      ? moduleData.connectors.map((conn, index) => {
                          return (
                            <div
                              key={`${conn.x}-${conn.y}`}
                              className={
                                'flex flex-row cursor-pointer ' +
                                (activeRefDes == conn.refDes
                                  ? ' bg-yellow-500 text-black bg-opacity-100'
                                  : 'bg-black text-primary/50 bg-opacity-0')
                              }
                              onMouseEnter={() => {
                                setActiveRefDes(conn.refDes);
                              }}
                            >
                              <div className="shrink-0 grow-0 w-10">
                                {conn.refDes}
                              </div>
                              <div className="">
                                {conn.name} {conn.is_input ? 'Input' : 'Output'}
                              </div>
                            </div>
                          );
                        })
                      : null}
                  </p>
                  {moduleData.controls.length > 0 ? <h3>Controls</h3> : null}

                  <p>
                    {moduleData.controls.length > 0
                      ? moduleData.controls.map((conn, index) => {
                          return (
                            <div
                              key={`${conn.x}-${conn.y}`}
                              className={
                                'flex flex-row cursor-pointer ' +
                                (activeRefDes == conn.refDes
                                  ? ' bg-yellow-500 text-black bg-opacity-100'
                                  : 'bg-black text-primary/50 bg-opacity-0')
                              }
                              onMouseEnter={() => {
                                setActiveRefDes(conn.refDes);
                              }}
                            >
                              <div className="shrink-0 grow-0 w-10">
                                {conn.refDes}
                              </div>
                              <div className="">{conn.name}</div>
                            </div>
                          );
                        })
                      : null}
                  </p>
                </div>
              </>
            ) : (
              ''
            )}
            {moduleData.connectors.length == 0 &&
            moduleData.controls.length == 0 ? (
              ''
            ) : portraitAspect == true ? (
              <>
                <div className="basis-[100%] xl:basis-1/2">
                  {moduleData.connectors.length > 0 ? (
                    <h3>Connectors</h3>
                  ) : null}
                  <p>
                    {moduleData.connectors.length > 0
                      ? moduleData.connectors.map((conn, index) => {
                          return (
                            <div
                              key={`${conn.x}-${conn.y}`}
                              className={
                                'flex flex-row cursor-pointer ' +
                                (activeRefDes == conn.refDes
                                  ? ' bg-yellow-500 text-black bg-opacity-100'
                                  : 'bg-black text-primary/50 bg-opacity-0')
                              }
                              onMouseEnter={() => {
                                setActiveRefDes(conn.refDes);
                              }}
                            >
                              <div className="shrink-0 grow-0 w-10">
                                {conn.refDes}
                              </div>
                              <div className="">
                                {conn.name} {conn.is_input ? 'Input' : 'Output'}
                              </div>
                            </div>
                          );
                        })
                      : null}
                  </p>
                </div>
                <div className="basis-[100%] xl:basis-1/2">
                  {moduleData.controls.length > 0 ? <h3>Controls</h3> : null}
                  <p>
                    {moduleData.controls.length > 0
                      ? moduleData.controls.map((conn, index) => {
                          return (
                            <div
                              key={`${conn.x}-${conn.y}`}
                              className={
                                'flex flex-row cursor-pointer ' +
                                (activeRefDes == conn.refDes
                                  ? ' bg-yellow-500 text-black bg-opacity-100'
                                  : 'bg-black text-primary/50 bg-opacity-0')
                              }
                              onMouseEnter={() => {
                                setActiveRefDes(conn.refDes);
                              }}
                            >
                              <div className="shrink-0 grow-0 w-10">
                                {conn.refDes}
                              </div>
                              <div className="">{conn.name}</div>
                            </div>
                          );
                        })
                      : null}
                  </p>
                </div>
              </>
            ) : (
              ''
            )}
          </div>

          {moduleData.assets.length > 0 ? (
            <h2>
              <TbRectangleFilled className="inline-block align-middle" />{' '}
              <span className="align-middle">Downloads</span>
            </h2>
          ) : (
            ''
          )}
          <p>
            {moduleData.assets.map((asset) => {
              return (
                <div
                  key={`${moduleData.company}-${moduleData.name}-${asset.name}`}
                >
                  <a
                    target="_blank"
                    href={'/assets/' + asset.file_name}
                    rel="noreferrer"
                  >
                    {asset.name} ({asset.file_type.toUpperCase()})
                  </a>
                  <br />
                </div>
              );
            })}
          </p>

          {hasPatchFeatures ? (
            <h2>
              <TbRectangleFilled className="inline-block align-middle" />{' '}
              <span className="align-middle">Patching Tips</span>
            </h2>
          ) : (
            ''
          )}
          {hasPatchFeatures
            ? moduleData.features.map((feature) => {
                return feature.topic == 'Patch' ? (
                  <div
                    key={`${moduleData.company}-${moduleData.name}-${feature.name}`}
                  >
                    <h3>{feature.name}</h3>
                    <p
                      dangerouslySetInnerHTML={{__html: feature.description}}
                    ></p>
                  </div>
                ) : (
                  ''
                );
              })
            : ''}
          {hasSystemFeatures ? (
            <h2>
              <TbRectangleFilled className="inline-block align-middle" />{' '}
              <span className="align-middle">System Building Tips</span>
            </h2>
          ) : (
            ''
          )}
          {hasSystemFeatures
            ? moduleData.features.map((feature) => {
                return feature.topic == 'System' ? (
                  <div
                    key={`${moduleData.company}-${moduleData.name}-${feature.name}`}
                  >
                    <h3>{feature.name}</h3>
                    <p
                      dangerouslySetInnerHTML={{__html: feature.description}}
                    ></p>
                  </div>
                ) : (
                  ''
                );
              })
            : ''} */}
        </article>
      </div>
    </div>
  );
}
