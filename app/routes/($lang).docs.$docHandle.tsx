import { db } from '~/lib/db'
import {
  Section,
  Grid,
  Button,
  Text,
  PageHeader,
  Heading,
  Link,
  Modal
} from '~/components';
import { useEffect } from 'react';
import { useState}  from 'react'
import { useLocation } from 'react-use';
import { LoaderArgs } from '@shopify/remix-oxygen';
import { json } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';

export async function loader({params, request, context}: LoaderArgs) {
  const {docHandle} = params;
  return json(
    {
      docHandle
    }
  );
}

export default function GettingStarted() {
  const {docHandle} =
    useLoaderData<typeof loader>();
  
  const location = useLocation()
  
  const [contentHTML,setContentHTML] = useState("")
  useEffect(()=>{
    fetch('../..//public/docs/' + docHandle + '.html').then((res)=>res.text()).then((data)=>{
      setContentHTML(data)
     })
     
  },[])
  
  return (
    <>
      <Section>
        <div dangerouslySetInnerHTML={{ __html: contentHTML }} ></div>
      </Section>
    </>
  );
}

