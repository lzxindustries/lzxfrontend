import {Outlet, useOutletContext} from '@remix-run/react';
import type {InstrumentLayoutLoaderData} from './($lang).instruments.$slug';
import type {InstrumentHubData} from '~/data/hub-loaders';

export default function InstrumentManualLayout() {
  const data = useOutletContext<InstrumentLayoutLoaderData>();
  return <Outlet context={data} />;
}
