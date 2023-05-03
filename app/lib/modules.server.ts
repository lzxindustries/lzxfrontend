import { Module, APIBaseURL } from './api.types'

export async function getModules() {
    const res = await fetch(
        APIBaseURL + '/modules/'
    ).then((res) => res.json());
    return res as Module[]
};

export async function getModule(title: string) {
    console.log(title)
    const res = await fetch(
        APIBaseURL + '/modules/' + title
    ).then((res) => res.json());
    return res as Module
}