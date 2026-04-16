import patchesData from '../../db/lzxdb.Patch.json';
import patchModulesData from '../../db/lzxdb.PatchModule.json';
import modulesData from '../../db/lzxdb.Module.json';
import artistsData from '../../db/lzxdb.Artist.json';
import videosData from '../../db/lzxdb.Video.json';
import moduleVideosData from '../../db/lzxdb.ModuleVideo.json';
import glossaryTermsData from '../../db/lzxdb.GlossaryTerm.json';
import glossaryDefinitionsData from '../../db/lzxdb.GlossaryDefinition.json';

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
