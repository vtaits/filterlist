import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Browser,
} from '@vtaits/react-router-dom-fake-browser';
import { AllFeatures } from './AllFeatures';
import { HistoryDataStore } from './HistoryDataStore';

const meta: Meta = {
  title: 'filterlist',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const AllFeaturesStory: Story = {
  name: 'All features',
  args: {},
  render: () => (
    <AllFeatures />
  ),
};

export const HistoryDataStoreStory: Story = {
  name: 'History data store story',
  args: {},
  render: () => (
    <Browser>
      <HistoryDataStore />
    </Browser>
  ),
};
