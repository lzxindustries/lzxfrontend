import { PatchInterface } from '~/models/patch'
import { ArtistInterface } from '~/models/artist'
import { getDataCollection } from './db.common.server';
import { AppLoadContext } from "@shopify/remix-oxygen";
import { getArtist, getArtistName } from './db.artist.server';

export async function getPatches(context: AppLoadContext) {
    var patches = await getDataCollection(context, "Patch") as PatchInterface[]
    var artists = await getDataCollection(context, "Artist") as ArtistInterface[]
    //console.log(artists)
    //console.log(patches)
    patches.forEach((patch) =>
    {
        artists.forEach((artist) =>
        {
            //console.log("testing " + patch.artist + " is equal to " + artist._id)
            if(patch.artist == artist._id)         
            {
                // console.log("matched! " + artist.name)
                patch.artist_name = artist.name;
            }   
        })        
    })
    // console.log(result)
    return patches
};
