import {
  Browser,
} from '@vtaits/react-router-dom-fake-browser';

import { UseFilterlist } from './UseFilterlist';

export default {
  title: 'react-filterlist',
  component: UseFilterlist,
};

const Template = (args) => (
  <Browser>
    <UseFilterlist {...args} />
  </Browser>
);

export const UseFilterlistExample = Template.bind({});
UseFilterlistExample.args = {
  primary: true,
  label: 'UseFilterlist',
};
