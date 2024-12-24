import {PatchView} from '~/views/patch';
import {PatchInterface} from '~/models/patch';
import {ArtistInterface} from '~/models/artist';
import {getDataCollection} from '~/lib/db.server';
import {AppLoadContext} from '@shopify/remix-oxygen';
import {VideoInterface} from '~/models/video';
import {PatchVideoInterface} from '~/models/patch_video';
import {PatchModuleInterface} from '~/models/patch_module';
import {ModuleInterface} from '~/models/module';

export async function getAllPatches(context: AppLoadContext) {
  const patch_datas = (await getDataCollection(
    context,
    'Patch',
  )) as PatchInterface[];
  const artist_datas = (await getDataCollection(
    context,
    'Artist',
  )) as ArtistInterface[];
  const patch_videos_data = (await getDataCollection(
    context,
    'PatchVideo',
  )) as PatchVideoInterface[];
  const patch_modules_data = (await getDataCollection(
    context,
    'PatchModule',
  )) as PatchModuleInterface[];
  const modules_data = (await getDataCollection(
    context,
    'PatchModule',
  )) as ModuleInterface[];
  const videos_data = (await getDataCollection(
    context,
    'Video',
  )) as VideoInterface[];

  const patch_views: PatchView[] = [];

  patch_datas.map((patch_data) => {
    const patch_view: PatchView = {
      name: patch_data.name,
      diagram: patch_data.diagram,
      gif: patch_data.gif,
      notes: patch_data.notes,
      youtube: patch_data.youtube,
      artist: {
        name: 'Unknown',
      },
      videos: [],
      modules: [],
    };

    artist_datas.map((artist_data) => {
      patch_data.artist == artist_data._id
        ? (patch_view.artist.name = artist_data.name)
        : null;
    });

    // videos
    patch_videos_data.map((patch_video) => {
      patch_video.video == patch_data._id
        ? videos_data.map((video) => {
            video._id == patch_video.video
              ? patch_view.videos.push({
                  name: video.name,
                  youtube: video.youtube,
                  gif: video.gif,
                })
              : null;
          })
        : null;
    });

    // modules
    patch_modules_data.map((patch_module) => {
      patch_module.module == patch_data._id
        ? modules_data.map((module) => {
            module._id == patch_module.module
              ? patch_view.modules.push({
                  name: module.name,
                })
              : null;
          })
        : null;
    });

    patch_views.push(patch_view);
  });

  return patch_views;
}
