import {describe, expect, it} from 'vitest';
import {
  slugify,
  generateAssetDescription,
  inferAssetVersion,
  inferAssetPlatform,
  getPatches,
  getPatchBySlug,
  getVideos,
  getGlossary,
  getModuleByName,
  getModuleById,
  getModuleConnectors,
  getModuleControls,
  getModuleFeatures,
  getModuleAssets,
  getPatchesForModule,
  getVideosForModule,
} from '~/data/lzxdb';

describe('slugify', () => {
  it('converts spaces and special chars to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('lowercases the result', () => {
    expect(slugify('FooBar')).toBe('foobar');
  });

  it('strips leading and trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello');
  });

  it('collapses consecutive non-alphanumeric chars', () => {
    expect(slugify('foo   bar---baz')).toBe('foo-bar-baz');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles numeric input', () => {
    expect(slugify('Gen 3 Module')).toBe('gen-3-module');
  });
});

describe('generateAssetDescription', () => {
  it('identifies firmware files', () => {
    expect(generateAssetDescription('ESG3 Firmware v1.2', 'zip')).toBe(
      'Firmware update (ZIP)',
    );
  });

  it('identifies schematic files', () => {
    expect(generateAssetDescription('DSG3 Schematic Rev B', 'pdf')).toBe(
      'Hardware schematic (PDF)',
    );
  });

  it('identifies BOM files', () => {
    expect(generateAssetDescription('ESG3 BOM', 'csv')).toBe(
      'Bill of materials (CSV)',
    );
  });

  it('identifies BOM by full name', () => {
    expect(
      generateAssetDescription('ESG3 Bill of Materials', 'pdf'),
    ).toBe('Bill of materials (PDF)');
  });

  it('identifies manual files', () => {
    expect(generateAssetDescription('TBC2 User Manual', 'pdf')).toBe(
      'User manual (PDF)',
    );
  });

  it('identifies user guide files', () => {
    expect(generateAssetDescription('Vidiot User Guide', 'pdf')).toBe(
      'User manual (PDF)',
    );
  });

  it('identifies quickstart files', () => {
    expect(generateAssetDescription('Quickstart Guide', 'pdf')).toBe(
      'Quick start guide (PDF)',
    );
  });

  it('identifies quick start (two words) files', () => {
    expect(generateAssetDescription('Quick Start', 'pdf')).toBe(
      'Quick start guide (PDF)',
    );
  });

  it('returns generic description for unknown files', () => {
    expect(generateAssetDescription('Misc File', 'zip')).toBe(
      'ZIP download',
    );
  });

  it('uppercases file type in output', () => {
    expect(generateAssetDescription('Random', 'csv')).toBe('CSV download');
  });
});

describe('getPatches', () => {
  it('returns an array', () => {
    const patches = getPatches();
    expect(Array.isArray(patches)).toBe(true);
  });

  it('each patch has required fields', () => {
    const patches = getPatches();
    for (const p of patches) {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('slug');
      expect(typeof p.slug).toBe('string');
      expect(p.slug.length).toBeGreaterThan(0);
    }
  });
});

describe('getPatchBySlug', () => {
  it('returns undefined for non-existent slug', () => {
    expect(getPatchBySlug('nonexistent-xxxxx')).toBeUndefined();
  });

  it('returns a patch for a valid slug', () => {
    const patches = getPatches();
    if (patches.length > 0) {
      const result = getPatchBySlug(patches[0].slug);
      expect(result).toBeDefined();
      expect(result!.slug).toBe(patches[0].slug);
    }
  });
});

describe('getVideos', () => {
  it('returns an array of videos', () => {
    const videos = getVideos();
    expect(Array.isArray(videos)).toBe(true);
  });

  it('each video has required fields', () => {
    const videos = getVideos();
    for (const v of videos) {
      expect(v).toHaveProperty('id');
      expect(v).toHaveProperty('name');
      expect(v).toHaveProperty('youtube');
    }
  });
});

describe('getGlossary', () => {
  it('returns an array of glossary entries', () => {
    const glossary = getGlossary();
    expect(Array.isArray(glossary)).toBe(true);
  });

  it('each entry has term and definition', () => {
    const glossary = getGlossary();
    for (const entry of glossary) {
      expect(typeof entry.term).toBe('string');
      expect(typeof entry.definition).toBe('string');
      expect(entry.term.length).toBeGreaterThan(0);
    }
  });
});

describe('getModuleByName', () => {
  it('returns undefined for non-existent module', () => {
    expect(getModuleByName('ZZZZZ_NONEXISTENT')).toBeUndefined();
  });

  it('returns a module for a known name', () => {
    // ESG3 should exist in the dataset
    const module = getModuleByName('ESG3');
    if (module) {
      expect(module.name).toBe('ESG3');
      expect(module).toHaveProperty('id');
    }
  });
});

describe('getModuleById', () => {
  it('returns undefined for non-existent ID', () => {
    expect(getModuleById('000000000000000000000000')).toBeUndefined();
  });

  it('returns a module for a valid ID', () => {
    const module = getModuleByName('ESG3');
    if (module) {
      const result = getModuleById(module.id);
      expect(result).toBeDefined();
      expect(result!.name).toBe('ESG3');
    }
  });
});

describe('getModuleConnectors', () => {
  it('returns empty array for non-existent module', () => {
    expect(getModuleConnectors('000000000000000000000000')).toEqual([]);
  });

  it('returns connectors with required fields when they exist', () => {
    const module = getModuleByName('ESG3');
    if (module) {
      const connectors = getModuleConnectors(module.id);
      for (const c of connectors) {
        expect(c).toHaveProperty('id');
        expect(c).toHaveProperty('name');
        expect(c).toHaveProperty('moduleId');
      }
    }
  });
});

describe('getModuleControls', () => {
  it('returns empty array for non-existent module', () => {
    expect(getModuleControls('000000000000000000000000')).toEqual([]);
  });
});

describe('getModuleFeatures', () => {
  it('returns empty array for non-existent module', () => {
    expect(getModuleFeatures('000000000000000000000000')).toEqual([]);
  });
});

describe('getModuleAssets', () => {
  it('returns empty array for non-existent module', () => {
    expect(getModuleAssets('000000000000000000000000')).toEqual([]);
  });

  it('returns assets with description populated', () => {
    const module = getModuleByName('ESG3');
    if (module) {
      const assets = getModuleAssets(module.id);
      for (const a of assets) {
        expect(a).toHaveProperty('description');
        expect(typeof a.description).toBe('string');
        expect(a.description.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('getPatchesForModule', () => {
  it('returns empty array for non-existent module', () => {
    expect(getPatchesForModule('000000000000000000000000')).toEqual([]);
  });
});

describe('getVideosForModule', () => {
  it('returns empty array for non-existent module', () => {
    expect(getVideosForModule('000000000000000000000000')).toEqual([]);
  });
});

describe('inferAssetVersion', () => {
  it('extracts RevE from name', () => {
    expect(inferAssetVersion('Castle 000 Schematic RevE', 'castle-000-schematic_RevE.pdf')).toBe('RevE');
  });

  it('extracts semver from filename', () => {
    expect(inferAssetVersion('Firmware Update', 'firmware-1.0.6.bin')).toBe('v1.0.6');
  });

  it('extracts Rev3 from name', () => {
    expect(inferAssetVersion('Schematic Rev3', 'schematic-rev3.pdf')).toBe('Rev3');
  });

  it('returns null when no version pattern found', () => {
    expect(inferAssetVersion('User Manual', 'user-manual.pdf')).toBeNull();
  });

  it('extracts version with dot notation', () => {
    expect(inferAssetVersion('Firmware v2.1', 'firmware.bin')).toBe('v2.1');
  });
});

describe('inferAssetPlatform', () => {
  it('identifies macOS from .dmg extension', () => {
    expect(inferAssetPlatform('App', 'app.dmg')).toBe('macOS');
  });

  it('identifies macOS from "mac" in name', () => {
    expect(inferAssetPlatform('Mac Installer', 'installer.zip')).toBe('macOS');
  });

  it('identifies macOS from "darwin" in filename', () => {
    expect(inferAssetPlatform('App', 'app-darwin-x64.zip')).toBe('macOS');
  });

  it('identifies Windows from .exe extension', () => {
    expect(inferAssetPlatform('App', 'app.exe')).toBe('Windows');
  });

  it('identifies Windows from "win" in name', () => {
    expect(inferAssetPlatform('Windows Installer', 'installer.zip')).toBe('Windows');
  });

  it('identifies Linux from .AppImage extension', () => {
    expect(inferAssetPlatform('App', 'app.appimage')).toBe('Linux');
  });

  it('identifies Linux from .deb extension', () => {
    expect(inferAssetPlatform('App', 'app.deb')).toBe('Linux');
  });

  it('returns null for generic files', () => {
    expect(inferAssetPlatform('User Manual', 'user-manual.pdf')).toBeNull();
  });
});

describe('LzxModuleAsset version/platform fields', () => {
  it('assets have version, platform, and releaseDate fields', () => {
    // Get any module with assets
    const modules = getPatches();
    if (modules.length > 0) {
      const moduleWithAssets = modules[0].modules[0];
      if (moduleWithAssets) {
        const assets = getModuleAssets(moduleWithAssets.id);
        for (const a of assets) {
          expect(a).toHaveProperty('version');
          expect(a).toHaveProperty('platform');
          expect(a).toHaveProperty('releaseDate');
        }
      }
    }
  });
});
