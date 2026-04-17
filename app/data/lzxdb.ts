import patchesData from '../../db/lzxdb.Patch.json';
import patchModulesData from '../../db/lzxdb.PatchModule.json';
import modulesData from '../../db/lzxdb.Module.json';
import artistsData from '../../db/lzxdb.Artist.json';
import videosData from '../../db/lzxdb.Video.json';
import moduleVideosData from '../../db/lzxdb.ModuleVideo.json';
import glossaryTermsData from '../../db/lzxdb.GlossaryTerm.json';
import glossaryDefinitionsData from '../../db/lzxdb.GlossaryDefinition.json';
import connectorsData from '../../db/lzxdb.ModuleConnector.json';
import controlsData from '../../db/lzxdb.ModuleControl.json';
import featuresData from '../../db/lzxdb.ModuleFeature.json';
import assetsData from '../../db/lzxdb.ModuleAsset.json';
import assetRecordsData from '../../db/lzxdb.Asset.json';

// --- Helpers ---

function oid(ref: {$oid: string}): string {
  return ref.$oid;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// --- Types ---

export interface LzxPatch {
  id: string;
  name: string;
  slug: string;
  notes: string;
  diagram: string;
  youtube: string | null;
  gif?: string;
  artist: LzxArtist | null;
  modules: LzxModule[];
}

export interface LzxModule {
  id: string;
  name: string;
  subtitle?: string;
  shopifyId?: string;
  handle: string;
}

export interface LzxArtist {
  id: string;
  name: string;
}

export interface LzxVideo {
  id: string;
  name: string;
  youtube: string;
  modules: LzxModule[];
}

export interface LzxGlossaryEntry {
  term: string;
  definition: string;
}

// --- Lookup maps ---

const artistMap = new Map<string, LzxArtist>();
for (const a of artistsData) {
  artistMap.set(oid(a._id), {id: oid(a._id), name: a.name});
}

const moduleMap = new Map<string, LzxModule>();
for (const m of modulesData) {
  moduleMap.set(oid(m._id), {
    id: oid(m._id),
    name: m.name,
    subtitle: (m as Record<string, unknown>).subtitle as string | undefined,
    shopifyId: (m as Record<string, unknown>).id as string | undefined,
    handle: slugify(m.name),
  });
}

// Patch → Module join table
const patchModuleMap = new Map<string, string[]>();
for (const pm of patchModulesData) {
  const patchId = oid(pm.patch);
  const moduleId = oid(pm.module);
  const existing = patchModuleMap.get(patchId);
  if (existing) {
    existing.push(moduleId);
  } else {
    patchModuleMap.set(patchId, [moduleId]);
  }
}

// Module → Video join table
const moduleVideoMap = new Map<string, string[]>();
for (const mv of moduleVideosData) {
  const videoId = oid(mv.video);
  const moduleId = oid(mv.module);
  const existing = moduleVideoMap.get(videoId);
  if (existing) {
    existing.push(moduleId);
  } else {
    moduleVideoMap.set(videoId, [moduleId]);
  }
}

// --- Patch data ---

function buildPatch(raw: (typeof patchesData)[number]): LzxPatch {
  const patchId = oid(raw._id);
  const artistRef = (raw as Record<string, unknown>).artist as
    | {$oid: string}
    | undefined;
  const inlineModules = (raw as Record<string, unknown>).modules as
    | {$oid: string}[]
    | undefined;

  // Modules come from both inline refs and the join table
  const moduleIds = new Set<string>();
  if (inlineModules) {
    for (const ref of inlineModules) moduleIds.add(oid(ref));
  }
  const joinIds = patchModuleMap.get(patchId);
  if (joinIds) {
    for (const id of joinIds) moduleIds.add(id);
  }

  return {
    id: patchId,
    name: raw.name,
    slug: slugify(raw.name),
    notes: (raw as Record<string, unknown>).notes as string ?? '',
    diagram: (raw as Record<string, unknown>).diagram as string ?? '',
    youtube: (raw as Record<string, unknown>).youtube as string | null ?? null,
    gif: (raw as Record<string, unknown>).gif as string | undefined,
    artist: artistRef ? (artistMap.get(oid(artistRef)) ?? null) : null,
    modules: [...moduleIds]
      .map((id) => moduleMap.get(id))
      .filter((m): m is LzxModule => m != null),
  };
}

const allPatches: LzxPatch[] = patchesData.map(buildPatch);

const slugToPatch = new Map<string, LzxPatch>();
for (const p of allPatches) {
  slugToPatch.set(p.slug, p);
}

export function getPatches(): LzxPatch[] {
  return allPatches;
}

export function getPatchBySlug(slug: string): LzxPatch | undefined {
  return slugToPatch.get(slug);
}

// --- Video data ---

function buildVideo(raw: (typeof videosData)[number]): LzxVideo {
  const videoId = oid(raw._id);
  const moduleIds = moduleVideoMap.get(videoId) ?? [];

  return {
    id: videoId,
    name: raw.name,
    youtube: raw.youtube,
    modules: moduleIds
      .map((id) => moduleMap.get(id))
      .filter((m): m is LzxModule => m != null),
  };
}

const allVideos: LzxVideo[] = videosData.map(buildVideo);

export function getVideos(): LzxVideo[] {
  return allVideos;
}

// --- Glossary data ---

export function getGlossary(): LzxGlossaryEntry[] {
  return glossaryTermsData.map((term) => {
    const termId = oid(term._id);
    const def = glossaryDefinitionsData.find(
      (d) => oid(d.glossary_term) === termId,
    );
    return {
      term: term.name,
      definition: def?.description ?? '',
    };
  });
}

// --- Module lookup (for cross-linking from product pages) ---

export function getModuleByName(name: string): LzxModule | undefined {
  return [...moduleMap.values()].find(
    (m) => m.name.toLowerCase() === name.toLowerCase(),
  );
}

export function getPatchesForModule(moduleId: string): LzxPatch[] {
  return allPatches.filter((p) => p.modules.some((m) => m.id === moduleId));
}

export function getVideosForModule(moduleId: string): LzxVideo[] {
  return allVideos.filter((v) => v.modules.some((m) => m.id === moduleId));
}

// --- Module detail types ---

export interface LzxModuleConnector {
  id: string;
  moduleId: string;
  partId: string | null;
  isInput: boolean;
  isOutput: boolean;
  name: string;
  refDes: string;
  x: number;
  y: number;
}

export interface LzxModuleControl {
  id: string;
  moduleId: string;
  partId: string | null;
  name: string;
  refDes: string;
  isGain: boolean;
  x: number;
  y: number;
}

export interface LzxModuleFeature {
  id: string;
  moduleId: string;
  name: string;
  topic: string;
  description: string;
}

export interface LzxAsset {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
}

export interface LzxModuleAsset {
  id: string;
  moduleId: string;
  assetId: string;
  name: string;
  fileName: string;
  fileType: string;
}

// --- Module detail lookup maps ---

const connectorsByModule = new Map<string, LzxModuleConnector[]>();
for (const c of connectorsData) {
  const moduleId = oid(c.module);
  const entry: LzxModuleConnector = {
    id: oid(c._id),
    moduleId,
    partId: c.part ? oid(c.part) : null,
    isInput: !!(c as Record<string, unknown>).is_input,
    isOutput: !!(c as Record<string, unknown>).is_output,
    name: c.name ?? '',
    refDes: String((c as Record<string, unknown>).refDes ?? ''),
    x: Number((c as Record<string, unknown>).x) || 0,
    y: Number((c as Record<string, unknown>).y) || 0,
  };
  const existing = connectorsByModule.get(moduleId);
  if (existing) existing.push(entry);
  else connectorsByModule.set(moduleId, [entry]);
}

const controlsByModule = new Map<string, LzxModuleControl[]>();
for (const c of controlsData) {
  const moduleId = oid(c.module);
  const entry: LzxModuleControl = {
    id: oid(c._id),
    moduleId,
    partId: c.part ? oid(c.part) : null,
    name: c.name ?? '',
    refDes: String((c as Record<string, unknown>).refDes ?? ''),
    isGain: !!(c as Record<string, unknown>).is_gain,
    x: Number((c as Record<string, unknown>).x) || 0,
    y: Number((c as Record<string, unknown>).y) || 0,
  };
  const existing = controlsByModule.get(moduleId);
  if (existing) existing.push(entry);
  else controlsByModule.set(moduleId, [entry]);
}

const featuresByModule = new Map<string, LzxModuleFeature[]>();
for (const f of featuresData) {
  const moduleId = oid(f.module);
  const entry: LzxModuleFeature = {
    id: oid(f._id),
    moduleId,
    name: f.name,
    topic: String((f as Record<string, unknown>).topic ?? ''),
    description: String((f as Record<string, unknown>).description ?? ''),
  };
  const existing = featuresByModule.get(moduleId);
  if (existing) existing.push(entry);
  else featuresByModule.set(moduleId, [entry]);
}

const assetMap = new Map<string, LzxAsset>();
for (const a of assetRecordsData) {
  const id = oid(a._id);
  assetMap.set(id, {
    id,
    name: a.name,
    fileName: a.file_name,
    fileType: a.file_type,
  });
}

const assetsByModule = new Map<string, LzxModuleAsset[]>();
for (const a of assetsData) {
  const moduleId = oid(a.module);
  const assetId = oid(a.asset);
  const resolved = assetMap.get(assetId);
  const entry: LzxModuleAsset = {
    id: oid(a._id),
    moduleId,
    assetId,
    name: resolved?.name ?? assetId,
    fileName: resolved?.fileName ?? '',
    fileType: resolved?.fileType ?? '',
  };
  const existing = assetsByModule.get(moduleId);
  if (existing) existing.push(entry);
  else assetsByModule.set(moduleId, [entry]);
}

// --- Module detail getters ---

/** Get a module by its lzxdb _id */
export function getModuleById(moduleId: string): LzxModule | undefined {
  return moduleMap.get(moduleId);
}

/** Get all connectors for a module by lzxdb module _id */
export function getModuleConnectors(moduleId: string): LzxModuleConnector[] {
  return connectorsByModule.get(moduleId) ?? [];
}

/** Get all controls for a module by lzxdb module _id */
export function getModuleControls(moduleId: string): LzxModuleControl[] {
  return controlsByModule.get(moduleId) ?? [];
}

/** Get all features for a module by lzxdb module _id */
export function getModuleFeatures(moduleId: string): LzxModuleFeature[] {
  return featuresByModule.get(moduleId) ?? [];
}

/** Get all assets for a module by lzxdb module _id */
export function getModuleAssets(moduleId: string): LzxModuleAsset[] {
  return assetsByModule.get(moduleId) ?? [];
}
