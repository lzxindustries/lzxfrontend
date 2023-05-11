import type { Meta, StoryObj } from '@storybook/react';
import { AddToCartButton } from './AddToCartButton';
import {missingClass} from '~/lib/utils';

const meta = {
    title: 'Example/AddToCartButton',
    component: AddToCartButton,
    tags: ['autodocs'],
    args:
    {
    },
    argTypes: 
    {
    },
} satisfies Meta<typeof AddToCartButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Primary: Story = {
  args: {
    variant: 'primary'
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary'
  },
};

export const Inline: Story = {
  args: {
    variant: 'inline'
  },
};
