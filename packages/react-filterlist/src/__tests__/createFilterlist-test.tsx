import React from 'react';
import type {
  FC,
  ReactNode,
} from 'react';
import {
  shallow,
} from 'enzyme';
import type {
  ShallowWrapper,
} from 'enzyme';

import listActions from '../../__fixtures__/listActions';

import Filterlist from '../Filterlist';
import createFilterlist from '../createFilterlist';

import type {
  ComponentRenderProps,
} from '../types';

const TestComponent: FC = () => <div />;

const defaultOptions = {
  loadItems: Function.prototype,
};

type RenderChildren = (renderProps: ComponentRenderProps<any, any, any>) => ReactNode;

class PageObject {
  wrapper: ShallowWrapper;

  constructor(options, props) {
    const WithFilterlist = createFilterlist({
      ...defaultOptions,
      ...options,
    })(TestComponent);

    this.wrapper = shallow(
      <WithFilterlist
        {...props}
      />,
    );
  }

  getFilterlistNode(): ShallowWrapper {
    return this.wrapper.find(Filterlist);
  }

  getFilterlistProp(propName): any {
    return this.getFilterlistNode().prop(propName);
  }

  renderTestComponentNode(filterlistProps: ComponentRenderProps<any, any, any>): ShallowWrapper {
    const renderContent: RenderChildren = this.getFilterlistNode().prop('children');

    const renderedContent: ReactNode = renderContent(filterlistProps);

    const wrapper: ShallowWrapper = shallow(
      <div>
        {renderedContent}
      </div>,
    );

    return wrapper.find(TestComponent);
  }

  getChildProps(filterlistProps: ComponentRenderProps<any, any, any>): Record<string, any> {
    const testComponentNode: ShallowWrapper = this.renderTestComponentNode(filterlistProps);

    return testComponentNode.props();
  }
}

const setup = (options, props): PageObject => new PageObject(options, props);

test('should provide options from decorator', () => {
  const page = setup(
    {
      param1: 'value1',
      param2: 'value2',
    },
    {},
  );

  expect(page.getFilterlistProp('param1')).toBe('value1');
  expect(page.getFilterlistProp('param2')).toBe('value2');
});

test('should set filtersAndSortData as component props', () => {
  const page = setup({}, {
    param1: 'value1',
    param2: 'value2',
  });

  expect(page.getFilterlistProp('filtersAndSortData')).toEqual({
    param1: 'value1',
    param2: 'value2',
  });
});

test('should call loadItems with props of component', () => {
  const loadItems = jest.fn();

  const page = setup({
    loadItems,
  }, {
    param1: 'value1',
    param2: 'value2',
  });

  page.getFilterlistProp('loadItems')('Test list state');

  expect(loadItems.mock.calls.length).toBe(1);
  expect(loadItems.mock.calls[0][0]).toBe('Test list state');
  expect(loadItems.mock.calls[0][1]).toEqual({
    param1: 'value1',
    param2: 'value2',
  });
});

test('should call onChangeLoadParams with props of component', () => {
  const onChangeLoadParams = jest.fn();

  const page = setup({
    onChangeLoadParams,
  }, {
    param1: 'value1',
    param2: 'value2',
  });

  page.getFilterlistProp('onChangeLoadParams')('Test list state');

  expect(onChangeLoadParams.mock.calls.length).toBe(1);
  expect(onChangeLoadParams.mock.calls[0][0]).toBe('Test list state');
  expect(onChangeLoadParams.mock.calls[0][1]).toEqual({
    param1: 'value1',
    param2: 'value2',
  });
});

test('should not provide onChangeLoadParams if not defined in options', () => {
  const page = setup({}, {});

  expect(page.getFilterlistProp('onChangeLoadParams')).toBeFalsy();
});

test('should add filterlist props to child component', () => {
  const page = setup({}, {
    param1: 'value1',
    param2: 'value2',
  });

  const childProps = page.getChildProps({
    isListInited: true,
    listActions,
  });

  expect(childProps).toEqual({
    param1: 'value1',
    param2: 'value2',
    isListInited: true,
    listActions,
  });
});
