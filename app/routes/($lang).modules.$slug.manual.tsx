import {Outlet, useOutletContext} from '@remix-run/react';
import type {ModuleLayoutLoaderData} from './($lang).modules.$slug';

export default function ModuleManualLayout() {
  const data = useOutletContext<ModuleLayoutLoaderData>();
  return <Outlet context={data} />;
}
