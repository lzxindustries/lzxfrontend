import type {ModulePartView} from './module_part';

export type ModuleControlView = {
  refDes: string;
  name: string;
  part: ModulePartView;
  is_gain: boolean;
  is_bias: boolean;
  x: number;
  y: number;
};
