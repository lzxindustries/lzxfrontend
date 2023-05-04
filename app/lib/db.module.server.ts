import { ModuleCollection, ModuleDocument } from './db.module.types'
import { getDataCollection, getDataDocument } from './db.common.server';
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getModules(context: AppLoadContext) {
    const result = await getDataCollection(context, "Module") as ModuleCollection
    return result.documents
};

export async function getModule(context: AppLoadContext, title: string) {
    const result = await getDataDocument(context, "Module", {title}) as ModuleDocument
    return result.document
}