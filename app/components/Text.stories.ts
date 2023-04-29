import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';
import {statusMessage} from '~/lib/utils';

const meta = {
    title: 'Example/Text',
    component: Text,
    tags: ['autodocs'],
    args:
    {
    },
    argTypes: 
    {
    },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Primary: Story = {
  args: {
  },
};
