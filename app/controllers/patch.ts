import { PatchView } from "~/views/patch";
import { PatchInterface } from "~/models/patch";
import { ArtistInterface } from "~/models/artist";
import { getDataDocument } from "~/lib/db.server";
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getPatchView(context: AppLoadContext, id: string) {
    const patch_data = await getDataDocument(context, "Patch", { id }) as PatchInterface;
    const artist_data = await getDataDocument(context, "Artist", { id }) as ArtistInterface;

    var patch_view = {} as PatchView
    patch_view.name = patch_data.name
    patch_view.diagram = patch_data.diagram
    patch_view.gif = patch_data.gif
    patch_view.notes = patch_data.notes
    patch_view.youtube = patch_data.youtube
    
    // artist
    patch_view.artist.name = artist_data.name;

    return patch_view
}

