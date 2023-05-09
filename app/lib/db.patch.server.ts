import { PatchInterface } from '~/models/patch'
import { ArtistInterface } from '~/models/artist'
import { getDataCollection } from './db.common.server';
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getPatches(context: AppLoadContext) {
    var patches = await getDataCollection(context, "Patch") as PatchInterface[]
    var artists = await getDataCollection(context, "Artist") as ArtistInterface[]
    
    patches.forEach((patch) =>
    {
        artists.forEach((artist) =>
        {
            if(patch.artist == artist._id)         
            {
                patch.artist_name = artist.name;
            }   
        })        
    })
    
    return patches
};
