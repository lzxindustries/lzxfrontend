import {ArtistView} from './artist';
import {PatchVideoView} from './patch_video';
import {PatchModuleView} from './patch_module';

export type PatchView = {
  notes: string;
  name: string;
  diagram: string;
  youtube: string;
  artist: ArtistView;
  gif: string;
  videos: PatchVideoView[];
  modules: PatchModuleView[];
};
