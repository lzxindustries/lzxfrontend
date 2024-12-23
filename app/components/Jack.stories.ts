import type {Meta, StoryObj} from '@storybook/react';
import {Jack} from './Jack';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'Example/Jack',
  component: Jack,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Jack>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Input: Story = {
  args: {
    pixelsPerHP: 20,
    xPosition: 50,
    yPosition: 50,
    isOutput: false,
    label: 'Input Jack',
  },
};

export const Output: Story = {
  args: {
    pixelsPerHP: 20,
    xPosition: 50,
    yPosition: 50,
    isOutput: true,
    label: 'Output Jack',
  },
};
