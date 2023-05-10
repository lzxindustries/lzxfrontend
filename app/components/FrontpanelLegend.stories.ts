import type { Meta, StoryObj } from '@storybook/react';
import { FrontpanelLegend } from './FrontpanelLegend';
import { FrontpanelMaterial } from './Frontpanel';

const meta = {
  title: 'Example/FrontpanelLegend',
  component: FrontpanelLegend,
  tags: ['autodocs'],
  args:
  {
  },
  argTypes:
  {
  },
} satisfies Meta<typeof FrontpanelLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const MatteBlack12HP: Story = {
  args: {
    pixelsPerHP: 20,
    module:
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
      hp: 12,
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
      controls: [
        {
          x: -900,
          y: -1875,
          refDes: "P1",
          name: "Pot One",
          part:
          {
            name: "Vertical 3.5mm Jack",
            image: "None"
          },
          is_gain: false,
          is_bias: false
        },
        {
          x: -300,
          y: -1875,
          refDes: "P2",
          name: "Pot Two",
          part:
          {
            name: "Vertical 3.5mm Jack",
            image: "None"
          },
          is_gain: false,
          is_bias: false
        },
        {
          x: 900,
          y: -1875,
          refDes: "P3",
          name: "Pot Three",
          part:
          {
            name: "Vertical 3.5mm Jack",
            image: "None"
          },
          is_gain: false,
          is_bias: false
        },
        {
          x: 300,
          y: -1875,
          refDes: "P4",
          name: "Pot Four",
          part:
          {
            name: "Vertical 3.5mm Jack",
            image: "None"
          },
          is_gain: false,
          is_bias: false
        }
      ],
      features: [],
    },
  },
};