import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Browser,
} from '@vtaits/react-router-dom-fake-browser';
import { DeferredInit } from './DeferredInit';
import { InfinityList } from './InfinityList';
import { UseFilterlist } from './UseFilterlist';

const meta: Meta = {
  title: 'react-filterlist',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const DeferredInitStory: Story = {
  name: 'Deferred init',
  args: {},
  render: () => (
    <Browser>
      <DeferredInit />
    </Browser>
  ),
};

export const InfinityListStory: Story = {
  name: 'Infinity list',
  args: {},
  render: () => (
    <Browser>
      <InfinityList />
    </Browser>
  ),
};

export const UseFilterlistStory: Story = {
  name: 'Use filterlist',
  args: {},
  render: () => (
    <Browser>
      <UseFilterlist />
    </Browser>
  ),
};
