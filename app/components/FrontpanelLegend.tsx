import React from 'react';
import { Frontpanel, FrontpanelMaterial } from './Frontpanel'
import { LegendRefDes } from './LegendRefDes'
import { ModuleConnectorView } from '~/views/module_connector';
import { ModuleControlView } from '~/views/module_control';
import { ModuleView } from '~/views/module';

export interface FrontpanelLegendProps {
  pixelsPerHP: number,
  module: ModuleView
}

export const FrontpanelLegend = ({
  pixelsPerHP = 20,
  module =
  {
    id: "",
    name: "",
    description: "",
    company:
    {
      name: "",
      legalName: ""
    },
    has_eurorack_power_entry: false,
    has_rear_video_sync_input: false,
    has_rear_video_sync_output: false,
    hp: 0,
    is_sync_ref_required: false,
    max_neg_12v_ma: 0,
    max_pos_12v_ma: 0,
    mounting_depth_mm: 0,
    subtitle: "",
    frontpanel: "",
    legend: "",
    has_front_video_sync_output: false,
    has_front_video_sync_input: false,
    is_hidden: false,
    has_dc_barrel_power_entry: false,
    has_eurorack_power_sync_input: false,
    has_eurorack_power_sync_output: false,
    has_rear_14_pin_sync_input: false,
    has_rear_14_pin_sync_output: false,
    is_sync_generator: false,
    external_url: "",
    connectors: [],
    controls: [],
    features: [],
  },
  ...props
}: FrontpanelLegendProps) => {

  const hpScale = 5.08; // millimeters
  const pixelsPerMm = pixelsPerHP / hpScale;
  const pixelsPerInch = pixelsPerHP * 5;
  const frontpanelHeight = 128.5 * pixelsPerMm; // millimeters
  const frontpanelWidth = module.hp * pixelsPerHP;
  const xCenter = frontpanelWidth / 2;
  const yCenter = frontpanelHeight / 2;

  return (
    // <div className="">
    //   <div className="">
    //     {/* <Frontpanel hpWidth={module.hp} pixelsPerHP={pixelsPerHP} material={material} /> */}
    //   </div>
      <div className="relative" style={{width: frontpanelWidth, height: frontpanelHeight}}>
        <img className="absolute top-0 left-0" width={frontpanelWidth} height={frontpanelHeight} src={"/images/" + module.frontpanel}/>
        {module.connectors.map((obj) => {
          const xPos = xCenter - 28 + ((obj.x / 1000) * pixelsPerInch);
          const yPos = yCenter + ((obj.y / 1000) * pixelsPerInch);
          return <div style={{ top: yPos, left: xPos }} className="absolute"><LegendRefDes refDes={obj.refDes} /></div>
        })}
        {module.controls.map((obj) => {
          const xPos = xCenter - 28 + ((obj.x / 1000) * pixelsPerInch);
          const yPos = yCenter + ((obj.y / 1000) * pixelsPerInch);
          return <div style={{ top: yPos, left: xPos }} className="absolute"><LegendRefDes refDes={obj.refDes} /></div>
        })}
      </div>
    // </div>
  );
};
