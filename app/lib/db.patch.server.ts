import { PatchCollection } from './db.patch.types'
import { getDataCollection } from './db.common.server';
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getPatches(context: AppLoadContext) {
    const result = await getDataCollection(context, "Patch") as PatchCollection
    return result.documents
};
