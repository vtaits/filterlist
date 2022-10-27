import {
  Browser,
} from '@vtaits/react-router-dom-fake-browser';

import { AllFeatures } from './AllFeatures';

export default {
  title: 'filterlist',
  component: AllFeatures,
};

const Template = (args) => (
  <Browser>
    <AllFeatures {...args} />
  </Browser>
);

export const AllFeaturesExample = Template.bind({});
AllFeaturesExample.args = {
  primary: true,
  label: 'AllFeatures',
};
