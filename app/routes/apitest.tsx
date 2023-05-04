// import { json } from "@shopify/remix-oxygen";
// import { Link, useLoaderData } from "@remix-run/react";
// import { getModules } from "~/lib/modules.server";

// type LoaderData = {
//   data: Awaited<ReturnType<typeof getModules>>;
// };

// export const loader = async () => {
//   return json<LoaderData>({
//     data: await getModules(),
//   });
// };

// export default function Apitest() {
//   const { data } = useLoaderData() as LoaderData;
//   console.log(data)
  
//   return (
//     <main className="mx-auto max-w-4xl">
//       <h1 className="my-6 border-b-2 text-center text-3xl">
//         Which Pokémon do you want to catch?</h1>
//       <ul className='mx-auto text-center'>
//         {JSON.stringify(data)}
//         {/* {data.map((pokemon) => (
//           <li key={pokemon.name}>
//             <Link
//               to={pokemon.name}
//               className="text-blue-600 underline"
//             >
//               {pokemon.name}
//             </Link>
//           </li>
//         ))} */}
//       </ul>
//     </main>
//   );
// }

import { json } from "@shopify/remix-oxygen";
import { getModules } from "~/lib/modules.server";
import { Form, Link, useLoaderData , useSearchParams, useSubmit } from "@remix-run/react";
import axios, { AxiosRequestConfig } from "axios";
import { PrismaClient } from '@prisma/client'
import RequestInfo from "@remix-run/react";
import { HeadersFunction } from "@shopify/remix-oxygen";
export async function loader() 
{
  console.log("API Test Loader Starting...")

  // const prisma = new PrismaClient()
  // const pdata = await prisma.testModel.findMany()
  // console.log(pdata)
  const pipeline = [{ $limit: 100 }]

  const body = JSON.stringify({
    collection:"Module",
    database:"lzxapp",
    dataSource:"lzxindustries",
    pipeline
  });

  const headers = new Headers([
    ["Content-Type", "application/json"],
    ["Access-Control-Request-Headers", "*"],
    ["api-key", "0nF9ZhH5LqEKWKK98JUmE6uEudf38vDnp3sklgXQzQKbIl0NZvL3HJ5OHvmZ4UA9"]
   ])

  // url: "https://us-west-2.aws.data.mongodb-api.com/app/data-surcw/endpoint/data/v1/action/aggregate",
  const config = {
      method: "post",
      headers,
      body
  };

  const result = await fetch("https://us-west-2.aws.data.mongodb-api.com/app/data-surcw/endpoint/data/v1/action/aggregate", config)
  // .then(function (response) {
  .then((response) => response.json())
  .then((data) => {
    console.log("Success!")
    //response.json()
    console.log(data);
  })
  .catch(function (error) { 
    console.log("Error!")
    console.log(error);
  });
  // let totalFound = await getCountMovies();;
  //console.log(result.json())
  console.log("Database query finished")
  // const modules = {name: "tester"}
  // console.log(modules.data)

  return {
      config
      // showCount: movies?.data?.documents?.length,
      // totalCount: totalFound,
      // documents: movies?.data?.documents
  };
};

// const getCountMovies = async (countFilter) => {
//   let pipeline = countFilter ?
//       [{ $match: countFilter }, { $count: 'count' }] :
//       [{ $count: 'count' }];

//   let data = JSON.stringify({
//       collection: "movies",
//       database: "sample_mflix",
//       dataSource: process.env.CLUSTER_NAME,
//       pipeline
//   });

//   let config = {
//       method: 'post',
//       url: `${process.env.DATA_API_BASE_URL}/action/aggregate`,
//       headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Request-Headers': '*',
//           'api-key': process.env.DATA_API_KEY
//       },
//       data
//   };

//   let result = await axios(config);

//   return result?.data?.documents[0]?.count;
// }

export default function APITest() {
  const modules = useLoaderData();
  console.log(modules)
 
   return (
       <div>
          {modules}
           {/* <h1>Movies</h1>
           <Form method="get">
               <input onChange={e => submit(e.currentTarget.form)}
                   id="searchBar" name="searchTerm" placeholder="Search movies..." />
               <p>Showing {totalShow} of total  {totalFound} movies found</p>
           </Form>
           <ul>
               {movies.documents.map(movie => (
                   <li key={movie.title}>
                       <Link to={movie.title}>{movie.title}</Link>
                   </li>
               ))}
           </ul> */}
       </div>
   );
}