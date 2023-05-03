import { Patch, APIBaseURL } from './api.types'

export async function getPatches() {
    const res = await fetch(
        APIBaseURL + '/patches/'
    ).then((res) => res.json());
    return res as Patch[]
};
