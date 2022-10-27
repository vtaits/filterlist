import {
  Browser,
} from '@vtaits/react-router-dom-fake-browser';

import { InfinityList } from './InfinityList';

export default {
  title: 'react-filterlist',
  component: InfinityList,
};

const Template = (args) => (
  <Browser>
    <InfinityList {...args} />
  </Browser>
);

export const InfinityListExample = Template.bind({});
InfinityListExample.args = {
  primary: true,
  label: 'InfinityList',
};
