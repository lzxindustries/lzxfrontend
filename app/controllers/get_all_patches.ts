import { PatchView } from "~/views/patch";
import { PatchInterface } from "~/models/patch";
import { ArtistInterface } from "~/models/artist";
import { getDataCollection } from "~/lib/db.server";
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getAllPatches(context: AppLoadContext) {
    const patch_datas = await getDataCollection(context, "Patch") as PatchInterface[];
    const artist_datas = await getDataCollection(context, "Artist") as ArtistInterface[];
    const patch_views: PatchView[] = [];
    
    patch_datas.map((patch_data) => {
        const patch_view: PatchView =
        {
            name: patch_data.name,
            diagram: patch_data.diagram,
            gif: patch_data.gif,
            notes: patch_data.notes,
            youtube: patch_data.youtube,
            artist: 
            {
                name: "Unknown"
            }
        }

        artist_datas.map((artist_data) => {            
            patch_data.artist == artist_data._id ? patch_view.artist.name = artist_data.name : null
        })
        
        patch_views.push(patch_view)
    })

    console.log(patch_views)
    return patch_views
}
