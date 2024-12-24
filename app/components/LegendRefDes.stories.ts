import type {Meta, StoryObj} from '@storybook/react';
import {LegendRefDes} from './LegendRefDes';

const meta = {
  title: 'Example/LegendRefDes',
  component: LegendRefDes,
  tags: ['autodocs'],
  args: {},
  argTypes: {},
} satisfies Meta<typeof LegendRefDes>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Primary: Story = {
  args: {
    selected: false,
    refDes: 'J1',
  },
};

export const Selected: Story = {
  args: {
    selected: true,
    refDes: 'J1',
  },
};
