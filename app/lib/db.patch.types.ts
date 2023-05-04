import { ID } from './db.common.types'

export type Patch = {
    _id:      ID;
    notes:    string;
    title:    string;
    diagram:  string;
    videos:   PatchVideo[];
    modules?: PatchModule[];
    artists:  PatchArtist[];
}

export type PatchArtist = {
    name: string;
}

export type PatchModule = {
    title: string;
}

export type PatchVideo = {
    youtube: string;
}

export type PatchCollection = 
{
    documents: Patch[]
}