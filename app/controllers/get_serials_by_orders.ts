import type {AppLoadContext} from '@shopify/remix-oxygen';
import {getDataCollection} from '~/lib/db.server';

export interface SerialView {
  serialNumber: number;
  moduleName: string;
  moduleSlug: string;
  orderNumber: number;
}

export async function getSerialsByOrderNumbers(
  context: AppLoadContext,
  orderNumbers: number[],
): Promise<SerialView[]> {
  if (orderNumbers.length === 0) return [];

  const serials = await getDataCollection(context, 'Serial', [
    {$match: {order: {$in: orderNumbers}}},
    {
      $lookup: {
        from: 'Module',
        localField: 'module',
        foreignField: '_id',
        as: 'moduleData',
      },
    },
    {$unwind: {path: '$moduleData', preserveNullAndEmptyArrays: true}},
    {
      $project: {
        name: 1,
        order: 1,
        'moduleData.name': 1,
        'moduleData.slug': 1,
      },
    },
    {$sort: {order: -1, name: 1}},
  ]);

  return serials.map((s: any) => ({
    serialNumber: s.name,
    moduleName: s.moduleData?.name ?? 'Unknown Module',
    moduleSlug: s.moduleData?.slug ?? '',
    orderNumber: s.order,
  }));
}
