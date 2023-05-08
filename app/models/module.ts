export interface ModuleInterface {
  name: string;
  frontpanel: string;
  shopify: string;
  description: string;
  sku: string;
  price: number;
  // company: { type: Mongoose.Schema.Types.ObjectId, ref: 'company' };
  max_pos_12v_ma: number;
  max_neg_12v_ma: number;
  has_dc_barrel_power_entry: boolean;
  has_eurorack_power_entry: boolean;
  has_rear_video_sync_input: boolean;
  has_rear_video_sync_output: boolean;
  has_rear_14_pin_sync_output: boolean;
  has_rear_14_pin_sync_input: boolean;
  has_eurorack_power_sync_output: boolean;
  has_eurorack_power_sync_input: boolean;
  has_front_video_sync_input: boolean;
  has_front_video_sync_output: boolean;
  is_sync_ref_required: boolean;
  is_sync_generator: boolean;
  hp: number;
  mounting_depth_mm: number;
  is_hidden: boolean;
  // releaseDate: Date;
  // discontinuedDate: Date;
  subtitle: string;
}

// export { ModuleInterface };