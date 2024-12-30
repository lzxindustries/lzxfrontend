import type {AppLoadContext} from '@shopify/remix-oxygen';
import {getDataCollection} from '~/lib/db.server';
import type {ArtistInterface} from '~/models/artist';
import type {ModuleInterface} from '~/models/module';
import type {PatchInterface} from '~/models/patch';
import type {PatchModuleInterface} from '~/models/patch_module';
import type {PatchVideoInterface} from '~/models/patch_video';
import type {VideoInterface} from '~/models/video';
import type {PatchView} from '~/views/patch';

export async function getAllPatches(context: AppLoadContext) {
  const [
    patch_datas,
    artist_datas,
    patch_videos_data,
    patch_modules_data,
    modules_data,
    videos_data,
  ] = await Promise.all([
    getDataCollection(context, 'Patch') as Promise<PatchInterface[]>,
    getDataCollection(context, 'Artist') as Promise<ArtistInterface[]>,
    getDataCollection(context, 'PatchVideo') as Promise<PatchVideoInterface[]>,
    getDataCollection(context, 'PatchModule') as Promise<
      PatchModuleInterface[]
    >,
    getDataCollection(context, 'PatchModule') as Promise<ModuleInterface[]>,
    getDataCollection(context, 'Video') as Promise<VideoInterface[]>,
  ]);

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
      if (patch_data.artist == artist_data._id)
        patch_view.artist.name = artist_data.name;
    });

    // videos
    patch_videos_data.forEach((patch_video) => {
      if (patch_video.video == patch_data._id)
        videos_data.forEach((video) => {
          if (video._id == patch_video.video)
            patch_view.videos.push({
              name: video.name,
              youtube: video.youtube,
              gif: video.gif,
            });
        });
    });

    // modules
    patch_modules_data.forEach((patch_module) => {
      if (patch_module.module == patch_data._id)
        modules_data.forEach((module) => {
          if (module._id == patch_module.module)
            patch_view.modules.push({
              name: module.name,
            });
        });
    });

    patch_views.push(patch_view);
  });

  return patch_views;
}
