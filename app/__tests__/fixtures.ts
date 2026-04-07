import {vi} from 'vitest';
import type {ModuleInterface} from '~/models/module';
import type {CompanyInterface} from '~/models/company';
import type {DealerInterface} from '~/models/dealer';
import type {PatchInterface} from '~/models/patch';
import type {ArtistInterface} from '~/models/artist';
import type {VideoInterface} from '~/models/video';
import type {PatchModuleInterface} from '~/models/patch_module';
import type {PatchVideoInterface} from '~/models/patch_video';
import type {ModuleConnectorInterface} from '~/models/module_connector';
import type {ModuleControlInterface} from '~/models/module_control';
import type {ModuleFeatureInterface} from '~/models/module_feature';
import type {ModuleVideoInterface} from '~/models/module_video';
import type {ModuleAssetInterface} from '~/models/module_asset';
import type {PartInterface} from '~/models/part';
import type {AssetInterface} from '~/models/asset';

export const mockCompanies: CompanyInterface[] = [
  {_id: 'company-1', name: 'LZX Industries', legalName: 'LZX Industries LLC'},
  {_id: 'company-2', name: 'Brownshoesonly', legalName: 'Brownshoesonly LLC'},
];

export const mockModules: ModuleInterface[] = [
  {
    _id: 'mod-1',
    id: 'gid://shopify/Product/1001',
    name: 'Navigator',
    description: 'Dual spatial processing module',
    company: 'company-1',
    has_eurorack_power_entry: true,
    has_rear_video_sync_input: true,
    has_rear_video_sync_output: false,
    hp: 16,
    is_sync_ref_required: true,
    max_neg_12v_ma: 100,
    max_pos_12v_ma: 130,
    mounting_depth_mm: 32,
    subtitle: 'Spatial Processing',
    frontpanel: 'navigator-front-panel.jpg',
    legend: 'navigator-legend.svg',
    has_front_video_sync_output: false,
    has_front_video_sync_input: false,
    is_hidden: false,
    has_dc_barrel_power_entry: false,
    has_eurorack_power_sync_input: false,
    has_eurorack_power_sync_output: false,
    has_rear_14_pin_sync_input: false,
    has_rear_14_pin_sync_output: false,
    is_sync_generator: false,
    external_url: '',
    is_active_product: true,
    is_oem_product: false,
    in_stock_count: 5,
  },
  {
    _id: 'mod-2',
    id: 'gid://shopify/Product/1002',
    name: 'Chromagnon',
    description: 'Video synthesis all-in-one',
    company: 'company-1',
    has_eurorack_power_entry: false,
    has_rear_video_sync_input: true,
    has_rear_video_sync_output: true,
    hp: 0,
    is_sync_ref_required: false,
    max_neg_12v_ma: 0,
    max_pos_12v_ma: 0,
    mounting_depth_mm: 0,
    subtitle: 'All-in-One',
    frontpanel: 'chromagnon-front-panel.jpg',
    legend: '',
    has_front_video_sync_output: false,
    has_front_video_sync_input: false,
    is_hidden: false,
    has_dc_barrel_power_entry: true,
    has_eurorack_power_sync_input: false,
    has_eurorack_power_sync_output: false,
    has_rear_14_pin_sync_input: false,
    has_rear_14_pin_sync_output: false,
    is_sync_generator: true,
    external_url: '',
    is_active_product: true,
    is_oem_product: false,
    in_stock_count: 0,
  },
  {
    _id: 'mod-3',
    id: 'gid://shopify/Product/1003',
    name: 'Passage',
    description: 'Discontinued module',
    company: 'company-2',
    has_eurorack_power_entry: true,
    has_rear_video_sync_input: true,
    has_rear_video_sync_output: false,
    hp: 8,
    is_sync_ref_required: true,
    max_neg_12v_ma: 50,
    max_pos_12v_ma: 80,
    mounting_depth_mm: 25,
    subtitle: 'Key Generator',
    frontpanel: 'passage-front-panel.jpg',
    legend: 'passage-legend.svg',
    has_front_video_sync_output: false,
    has_front_video_sync_input: false,
    is_hidden: true,
    has_dc_barrel_power_entry: false,
    has_eurorack_power_sync_input: false,
    has_eurorack_power_sync_output: false,
    has_rear_14_pin_sync_input: false,
    has_rear_14_pin_sync_output: false,
    is_sync_generator: false,
    external_url: 'https://example.com/passage',
    is_active_product: false,
    is_oem_product: false,
    in_stock_count: 0,
  },
];

export const mockDealers: DealerInterface[] = [
  {
    name: 'Control Voltage',
    url: 'https://controlvoltage.net',
    country: 'United States',
    city: 'Portland',
    logo: 'control-voltage.png',
    state: 'OR',
  },
  {
    name: 'Schneidersladen',
    url: 'https://schneidersladen.de',
    country: 'Germany',
    city: 'Berlin',
    logo: 'schneidersladen.png',
    state: '',
  },
];

export const mockArtists: ArtistInterface[] = [
  {_id: 'artist-1', name: 'Lars Larsen'},
  {_id: 'artist-2', name: 'Andrei Jay'},
];

export const mockPatches: PatchInterface[] = [
  {
    _id: 'patch-1',
    name: 'Rainbow Generator',
    diagram: 'rainbow-gen.png',
    gif: 'rainbow-gen.gif',
    notes: 'Basic rainbow patch',
    youtube: 'https://youtube.com/watch?v=abc123',
    artist: 'artist-1',
  },
  {
    _id: 'patch-2',
    name: 'Feedback Loop',
    diagram: '',
    gif: '',
    notes: 'Use with caution',
    youtube: '',
    artist: 'artist-2',
  },
];

export const mockVideos: VideoInterface[] = [
  {_id: 'video-1', name: 'Tutorial 1', youtube: 'yt-1', gif: 'tut1.gif'},
  {_id: 'video-2', name: 'Demo Reel', youtube: 'yt-2', gif: 'demo.gif'},
];

export const mockPatchVideos: PatchVideoInterface[] = [
  {_id: 'pv-1', patch: 'patch-1', video: 'video-1'},
];

export const mockPatchModules: PatchModuleInterface[] = [
  {patch: 'patch-1', module: 'mod-1'},
  {patch: 'patch-1', module: 'mod-2'},
];

export const mockModuleConnectors: ModuleConnectorInterface[] = [
  {
    module: 'mod-1',
    name: 'Video In',
    refDes: 'J1',
    is_input: true,
    is_output: false,
    x: 10,
    y: 20,
    part: 'part-1',
  },
  {
    module: 'mod-1',
    name: 'Video Out',
    refDes: 'J2',
    is_input: false,
    is_output: true,
    x: 10,
    y: 60,
    part: 'part-1',
  },
];

export const mockModuleControls: ModuleControlInterface[] = [
  {
    module: 'mod-1',
    name: 'Gain',
    refDes: 'R1',
    is_gain: true,
    is_bias: false,
    x: 8,
    y: 40,
    part: 'part-2',
  },
];

export const mockModuleFeatures: ModuleFeatureInterface[] = [
  {
    module: 'mod-1',
    name: 'Dual Channel',
    description: 'Two independent processing channels',
    topic: 'Processing',
  },
];

export const mockModuleVideos: ModuleVideoInterface[] = [
  {_id: 'mv-1', module: 'mod-1', video: 'video-1'},
];

export const mockModuleAssets: ModuleAssetInterface[] = [
  {_id: 'ma-1', module: 'mod-1', asset: 'asset-1'},
];

export const mockParts: PartInterface[] = [
  {_id: 'part-1', name: '3.5mm Jack', image: 'jack-35mm.png'},
  {_id: 'part-2', name: 'Potentiometer', image: 'pot.png'},
];

export const mockAssets: AssetInterface[] = [
  {
    _id: 'asset-1',
    name: 'User Manual',
    file_name: 'navigator-manual.pdf',
    file_type: 'application/pdf',
  },
];

/**
 * Create a mock AppLoadContext for controller/db tests.
 */
export function createMockContext(overrides?: Partial<MockEnv>) {
  const env = {
    DATABASE_NAME: 'test-lzxdb',
    CLUSTER_NAME: 'test-cluster',
    DATA_API_BASE_URL: 'https://data.mongodb-api.com/app/test/endpoint/data/v1',
    DATA_API_KEY: 'test-api-key',
    SESSION_SECRET: 'test-secret',
    PUBLIC_STOREFRONT_API_TOKEN: 'test-storefront-token',
    PRIVATE_STOREFRONT_API_TOKEN: 'test-private-token',
    PUBLIC_STORE_DOMAIN: 'test.myshopify.com',
    PUBLIC_STOREFRONT_ID: 'test-id',
    ...overrides,
  };

  return {
    env,
    session: {},
    storefront: {
      query: vi.fn(),
      i18n: {country: 'US', language: 'EN'},
    },
    waitUntil: vi.fn(),
  } as any;
}

interface MockEnv {
  DATABASE_NAME: string;
  CLUSTER_NAME: string;
  DATA_API_BASE_URL: string;
  DATA_API_KEY: string;
  SESSION_SECRET: string;
  PUBLIC_STOREFRONT_API_TOKEN: string;
  PRIVATE_STOREFRONT_API_TOKEN: string;
  PUBLIC_STORE_DOMAIN: string;
  PUBLIC_STOREFRONT_ID: string;
}
