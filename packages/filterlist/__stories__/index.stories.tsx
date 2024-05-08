import type { Meta, StoryObj } from '@storybook/react';
import {
  Browser,
} from '@vtaits/react-router-dom-fake-browser';
import { AllFeatures } from './AllFeatures';

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
    <Browser>
      <AllFeatures />
    </Browser>
  ),
};
