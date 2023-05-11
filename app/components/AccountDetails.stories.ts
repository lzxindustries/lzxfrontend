import type { Meta, StoryObj } from '@storybook/react';
import { AccountDetails } from './AccountDetails';
import { missingClass } from '~/lib/utils';

const meta = {
  title: 'Example/AccountDetails',
  component: AccountDetails,
  tags: ['autodocs'],
  args:
  {
  },
  argTypes:
  {
  },
} satisfies Meta<typeof AccountDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    firstName: "Jane",
    lastName: "Doe",
    email: "janedoe@company.com",
    phone: "1 (123) 456-7890",
  }
};


