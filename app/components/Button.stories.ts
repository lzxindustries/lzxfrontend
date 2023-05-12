import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import {missingClass} from '~/lib/utils';

const meta = {
    title: 'Example/Button',
    component: Button,
    tags: ['autodocs'],
    args:
    {
    },
    argTypes: 
    {
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args


export const Primary: Story = {
  args: {
    variant: 'primary',
    children: ["Button"]
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: ["Button"]
  },
};

export const Inline: Story = {
  args: {
    variant: 'inline',
    children: ["Button"]
  },
};
