import type {Meta, StoryObj} from '@storybook/react';
import {Frontpanel, FrontpanelMaterial} from './Frontpanel';

const meta = {
  title: 'Example/Frontpanel',
  component: Frontpanel,
  tags: ['autodocs'],
  args: {
    material: FrontpanelMaterial.Aluminum,
  },
  argTypes: {
    material: {
      options: [0, 1], // iterator
      control: {
        type: 'select',
        labels: ['Matte Black', 'Aluminum'],
      },
    },
  },
} satisfies Meta<typeof Frontpanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const MatteBlack2HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 2,
  },
};

export const MatteBlack3HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 3,
  },
};

export const MatteBlack4HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 4,
  },
};

export const MatteBlack6HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 6,
  },
};

export const MatteBlack8HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 8,
  },
};

export const MatteBlack10HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 10,
  },
};

export const MatteBlack12HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 12,
  },
};

export const MatteBlack14HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 14,
  },
};

export const MatteBlack16HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 16,
  },
};

export const MatteBlack18HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 18,
  },
};

export const MatteBlack20HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 20,
  },
};

export const MatteBlack22HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 22,
  },
};

export const MatteBlack24HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 24,
  },
};

export const MatteBlack26HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 26,
  },
};

export const MatteBlack28HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 28,
  },
};

export const MatteBlack30HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 30,
  },
};

export const MatteBlack32HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 32,
  },
};
export const MatteBlack36HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 32,
  },
};
export const MatteBlack48HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 48,
  },
};
export const MatteBlack52HP: Story = {
  args: {
    material: FrontpanelMaterial.MatteBlack,
    pixelsPerHP: 20,
    hpWidth: 52,
  },
};
export const Aluminum32HP: Story = {
  args: {
    material: FrontpanelMaterial.Aluminum,
    pixelsPerHP: 20,
    hpWidth: 32,
  },
};
