import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './Link';
import {statusMessage} from '~/lib/utils';

const meta = {
    title: 'Example/Link',
    component: Link,
    tags: ['autodocs'],
    args:
    {
    },
    argTypes: 
    {
    },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Primary: Story = {
};
