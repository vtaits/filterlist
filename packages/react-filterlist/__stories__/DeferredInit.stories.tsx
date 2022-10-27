import {
  Browser,
} from '@vtaits/react-router-dom-fake-browser';

import { DeferredInit } from './DeferredInit';

export default {
  title: 'react-filterlist',
  component: DeferredInit,
};

const Template = (args) => (
  <Browser>
    <DeferredInit {...args} />
  </Browser>
);

export const DeferredInitExample = Template.bind({});
DeferredInitExample.args = {
  primary: true,
  label: 'DeferredInit',
};
