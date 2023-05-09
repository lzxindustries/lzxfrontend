import { ArtistInterface } from '../models/artist'
import { getDataCollection, getDataDocument } from './db.common.server';
import { AppLoadContext } from "@shopify/remix-oxygen";

export async function getArtists(context: AppLoadContext) {
    const result = await getDataCollection(context, "Artist") as ArtistInterface[]
    return result
};

export async function getArtist(context: AppLoadContext, id: string) {
    const result = await getDataDocument(context, "Artist", {id}) as ArtistInterface
    return result
}