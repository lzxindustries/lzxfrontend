import type { PatchInterface } from './patch';
import type { ModuleInterface } from './module';
import type { ArtistInterface } from './artist';
import type { CompanyInterface } from './company';
import type { AssemblyInterface } from './assembly';
import type { PartInterface } from './part';
import type { PlacementInterface } from './placement';
import type { BomInterface } from './bom';
import type { FeederInterface } from './feeder';
import type { MachineInterface } from './machine';
import type { RevisionInterface } from './revision';
import type { StackInterface } from './stack';
import type { ConnectorInterface } from './connector';
import type { CableInterface } from './cable';
import type { PatchModuleInterface } from './patch_module';
import type { ModuleAssemblyInterface } from './module_assembly';
import type { StackFeederPartInterface } from './stack_feeder_part';

import Mongoose from 'mongoose';

import { ArtistSchema } from './artist';
import { ModuleSchema } from './module';
import { PatchSchema } from './patch';
import { CompanySchema } from './company';
import { AssemblySchema } from './assembly';
import { PartSchema } from './part';
import { PlacementSchema } from './placement';
import { BomSchema } from './bom';
import { FeederSchema } from './feeder';
import { MachineSchema } from './machine';
import { RevisionSchema } from './revision';
import { StackSchema } from './stack';
import { ConnectorSchema } from './connector';
import { CableSchema } from './cable';
import { PatchModuleSchema } from './patch_module';
import { ModuleAssemblySchema } from './module_assembly';
import { StackFeederPartSchema } from './stack_feeder_part';

const connection = Mongoose.createConnection(process.env.DATABASE_URL);

export const patch = connection.model<PatchInterface>('patch', PatchSchema, 'Patch');
export const artist = connection.model<ArtistInterface>('artist', ArtistSchema, 'Artist');
export const module = connection.model<ModuleInterface>('module', ModuleSchema, 'Module');
export const company = connection.model<CompanyInterface>('company', CompanySchema, 'Company');
export const assembly = connection.model<AssemblyInterface>('assembly', AssemblySchema, 'Assembly');
export const part = connection.model<PartInterface>('part', PartSchema, 'Part');
export const placement = connection.model<PlacementInterface>('placement', PlacementSchema, 'Placement');
export const feeder = connection.model<FeederInterface>('feeder', FeederSchema, 'Feeder');
export const bom = connection.model<BomInterface>('bom', BomSchema, 'Bom');
export const machine = connection.model<MachineInterface>('machine', MachineSchema, 'Machine');
export const revision = connection.model<RevisionInterface>('revision', RevisionSchema, 'Revision');
export const stack = connection.model<StackInterface>('stack', StackSchema, 'Stack');
export const connector = connection.model<ConnectorInterface>('connector', ConnectorSchema, 'Connector');
export const cable = connection.model<CableInterface>('cable', CableSchema, 'Cable');
export const patch_module = connection.model<PatchModuleInterface>('patch_module', PatchModuleSchema, 'PatchModule');
export const module_assembly = connection.model<ModuleAssemblyInterface>('module_assembly', ModuleAssemblySchema, 'ModuleAssembly');
export const stack_feeder_part = connection.model<StackFeederPartInterface>('stack_feeder_part', StackFeederPartSchema, 'StackFeederPart');


export default connection;
