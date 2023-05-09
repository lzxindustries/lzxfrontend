import { CompanyInterface } from '../models/company'
import { getDataCollection, getDataDocument } from './db.common.server';
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getCompanies(context: AppLoadContext) {
    const result = await getDataCollection(context, "Company") as CompanyInterface[]
    return result
};

export async function getCompany(context: AppLoadContext, id: string) {
    const result = await getDataDocument(context, "Company", {id}) as CompanyInterface
    return result
}