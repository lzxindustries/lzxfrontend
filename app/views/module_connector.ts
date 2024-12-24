import {ModulePartView} from './module_part';

export type ModuleConnectorView = {
  refDes: string;
  name: string;
  part: ModulePartView;
  is_input: boolean;
  is_output: boolean;
  x: number;
  y: number;
};
