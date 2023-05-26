import ModalImage from "react-modal-image";
import {
  Section,
  Grid,
  Text,
  Link,
} from '~/components';
import { getAllDealers } from "~/controllers/get_all_dealers";
import { DealerView } from "~/views/dealer";
import { LoaderArgs } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import Article from "./($lang).journal.$journalHandle";


export async function loader({ params, request, context }: LoaderArgs) {
  const dealerData = await getAllDealers(context)
  return dealerData;
}

export default function Patches() {
  const dealerData = useLoaderData<typeof loader>()

  return (
    <>
      <div className="flex flex-auto justify-center">
        <article className="prose max-w-prose-wide px-8">
          {
            dealerData.map((dealer, it) => {
              return (
                <>
                  <div className="inline-block w-1/2 align-top">
                    <h2>{dealer.name}</h2>
                    <p>
                      {dealer.city}{dealer.state ? ", " + dealer.state : ''}<br />
                      {dealer.country}<br />
                      <a href={"https://" + dealer.url} target="_blank">{dealer.url}</a><br />
                    </p>

                  </div>
                  <div className="inline-block w-1/2 align-top">
                    <a href={"https://" + dealer.url} target="_blank"><img className="max-w-xs" src={"/dealers/" + dealer.logo} /></a>
                  </div>
                </>)
            })
          }
        </article>
      </div>
    </>
  );
}

