import type {Meta, StoryObj} from '@storybook/react';
import {IconMenu} from './Icon';

const meta = {
  title: 'Example/IconMenu',
  component: IconMenu,
  tags: ['autodocs'],
  args: {},
  argTypes: {},
} satisfies Meta<typeof IconMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Default: Story = {};
