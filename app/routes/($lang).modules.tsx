
import { useLoaderData } from "@remix-run/react";
import { LoaderArgs } from "@shopify/remix-oxygen";
import { getModules } from "~/lib/db.module.server";
import { Section } from "~/components/Text";
import { Link } from "@remix-run/react";

export async function loader({ params, request, context }: LoaderArgs) {
  const modules = await getModules(context)
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
        <table className="max-w-5xl w-auto">
          <tr>
            <th className="px-2">Company</th>
            <th className="px-2">Module</th>
            <th className="px-2">+12V Current</th>
            <th className="px-2">-12V Current</th>
            <th className="px-2">Generates Sync?</th>
            <th className="px-2">Sync Input Required?</th>
          </tr>
          {modules.map((module) => {
            var showModule = module.max_pos_12v_ma > 0 && module.is_hidden == false ? true : false;
            return (
              showModule ? <>
                <tr>
                  <td>{module.company_name}</td>
                  <td><Link className="underline" to={'/products/' + module.name.toLowerCase().replace(/\//g,'')}>{module.name}</Link></td>
                  <td>{module.max_pos_12v_ma}mA</td>
                  <td>{module.max_neg_12v_ma}mA</td>
                  <td className={module.is_sync_generator ? 'text-green-500' : ''}>{module.is_sync_generator ? 'Yes' : 'No'}</td>
                  <td className={module.is_sync_ref_required ? 'text-green-500' : ''}>{module.is_sync_ref_required ? 'Yes' : 'No'}</td>
                </tr></> : ''
            )
          })
          }
        </table>
      </Section>
    </>
  );
}

