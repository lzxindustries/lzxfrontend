import React from "react";
import { json } from "@shopify/remix-oxygen";


export async function getModules() {
    const res = await fetch(
        'http://localhost:5050/modules/'
    ).then((res) => res.json());
    //console.log(res)

    //return res.results;
    return res
//   return {
//     name: name,
//     img: res.sprites.front_default,
//   };
};

export async function getModule(title: string) {
    console.log(title)
    const res = await fetch(
        'http://localhost:5050/modules/' + title
    ).then((res) => res.json());
    //console.log(res)

    //return res.results;
    return res
//   return {
//     name: name,
//     img: res.sprites.front_default,
//   };
};