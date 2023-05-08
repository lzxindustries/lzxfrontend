import { PatchInterface } from '~/models/patch'
import { getDataCollection } from './db.common.server';
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getPatches(context: AppLoadContext) {
    const result = await getDataCollection(context, "Patch") as PatchInterface[]
    // console.log(result)
    return result
};
