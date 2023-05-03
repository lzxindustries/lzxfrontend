import { json } from "@shopify/remix-oxygen";
import { Link, useLoaderData } from "@remix-run/react";
import { getModules } from "~/lib/modules.server";

type LoaderData = {
  data: Awaited<ReturnType<typeof getModules>>;
};

export const loader = async () => {
  return json<LoaderData>({
    data: await getModules(),
  });
};

export default function Apitest() {
  const { data } = useLoaderData() as LoaderData;
  //console.log(data)
  
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        Which Pokémon do you want to catch?</h1>
      <ul className='mx-auto text-center'>
        {JSON.stringify(data)}
        {/* {data.map((pokemon) => (
          <li key={pokemon.name}>
            <Link
              to={pokemon.name}
              className="text-blue-600 underline"
            >
              {pokemon.name}
            </Link>
          </li>
        ))} */}
      </ul>
    </main>
  );
}