import type {Meta, StoryObj} from '@storybook/react';
import {ProductCard} from './ProductCard';
import {statusMessage} from '~/lib/utils';

const meta = {
  title: 'Example/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  args: {},
  argTypes: {},
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Default: Story = {};
