import { ModuleInterface } from '~/models/module'
import { CompanyInterface } from '~/models/company'
import { getDataCollection, getDataDocument } from './db.common.server';
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getModules(context: AppLoadContext) {
    var modules = await getDataCollection(context, "Module") as ModuleInterface[]
    var companies = await getDataCollection(context, "Company") as CompanyInterface[]

    modules.forEach((module) => {
        companies.forEach((company) => {
            if (module.company == company._id) {
                module.company_name = company.name;
                module.company_legalName = company.legalName;
            }
        })
    })

    return modules
};

export async function getModule(context: AppLoadContext, id: string) {
    const module = await getDataDocument(context, "Module", { id }) as ModuleInterface
    var companies = await getDataCollection(context, "Company") as CompanyInterface[]

    companies.forEach((company) => {
        if (module.company == company._id) {
            module.company_name = company.name;
            module.company_legalName = company.legalName;
        }
    })

    return module
}