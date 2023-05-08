import { ModuleInterface } from '../models/module'
import { getDataCollection, getDataDocument } from './db.common.server';
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getModules(context: AppLoadContext) {
    const result = await getDataCollection(context, "Module") as ModuleInterface[]
    return result
};

export async function getModule(context: AppLoadContext, id: string) {
    const result = await getDataDocument(context, "Module", {id}) as ModuleInterface
    return result
}