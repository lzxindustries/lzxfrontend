
import { useLoaderData } from "@remix-run/react";
import { LoaderArgs } from "@shopify/remix-oxygen";
import { getAllModules } from "~/controllers/get_all_modules";
import { ModuleView } from "~/views/module";
import { Section } from "~/components/Text";
import { Link } from "@remix-run/react";
import IconLink from "~/components/IconLink";
import { routeHeaders, CACHE_LONG } from '~/data/cache';
import { BsCheckSquareFill } from "react-icons/bs";
export const headers = routeHeaders;

export async function loader({ params, request, context }: LoaderArgs) {

  const modules = await getAllModules(context)
  return (
    {
      modules
    }
  );
}

export default function Product() {
  const { modules } = useLoaderData<typeof loader>();
  return (
    <>
      <Section className="flex flex-auto justify-center">
        <div className="overflow-x-auto">
          <table className="table table-compact w-full">
            <thead>
              <tr>
                <th >Company</th>
                <th >Module</th>
                <th >Status</th>
                <th >HP</th>
                <th >Depth</th>
                <th >+12V mA</th>
                <th >-12V mA</th>
                <th >Sync Gen?</th>
                <th >Sync Required?</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => {
                var showModule = module.max_pos_12v_ma > 0 && module.is_hidden == false && module.hp > 0 ? true : false;
                return (
                  showModule ? <>
                    <tr>
                      <td >{module.company.name}</td>
                      {
                        module.external_url ? <td ><Link className="underline" target="_blank" to={module.external_url}>{module.name}<IconLink className="inline-block" /></Link></td> :
                          module.is_active_product ? <td ><Link className="underline" to={'/products/' + module.name.toLowerCase().replace(/\//g, '').replace(/\s/g, '-')}>{module.name}</Link></td> : <td >{module.name}</td>
                      }
                      <td className={module.is_active_product ? 'text-green-500' : 'text-yellow-500'}>{module.is_active_product ? 'Active' : 'Legacy'}</td>
                      <td >{module.hp}HP</td>
                      <td >{module.mounting_depth_mm}mm</td>
                      <td >{module.max_pos_12v_ma > 0 ? module.max_pos_12v_ma + "mA" : ''}</td>
                      <td >{module.max_neg_12v_ma > 0 ? module.max_neg_12v_ma + "mA" : ''}</td>
                      <td className={module.is_sync_generator ? 'text-green-500' : ''}>{module.is_sync_generator ? 'Yes' : ''}</td>
                      <td className={module.is_sync_ref_required ? 'text-green-500' : ''}>{module.is_sync_ref_required ? 'Yes' : ''}</td>
                    </tr></> : ''
                )
              })
              }
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

