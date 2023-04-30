import React from 'react';
import type {
  ReactElement,
} from 'react';

import { createRenderer } from 'react-test-renderer/shallow';

import type {
  ListState,
} from '@vtaits/filterlist';

import listActions from '../../__fixtures__/listActions';

import Filterlist from '../Filterlist';
import createFilterlist from '../createFilterlist';

import type {
  HOCParams,
  ComponentParams,
  ComponentRenderProps,
} from '../types';

function TestComponent(): ReactElement {
  return <div />;
}

const defaultOptions: HOCParams<any, any, any> = {
  loadItems: jest.fn(),
};

class PageObject<Item, Additional, ErrorType, FiltersAndSortData> {
  wrapper: ReactElement<
  ComponentParams<Item, Additional, ErrorType, FiltersAndSortData>,
  typeof Filterlist
  >;

  constructor(
    options: Partial<HOCParams<Item, Additional, ErrorType>>,
    props: any,
  ) {
    const WithFilterlist = createFilterlist({
      ...defaultOptions,
      ...options,
    })(TestComponent);

    const renderer = createRenderer();

    renderer.render(
      <WithFilterlist
        {...props}
      />,
    );

    this.wrapper = renderer.getRenderOutput() as unknown as ReactElement<
    ComponentParams<Item, Additional, ErrorType, FiltersAndSortData>,
    typeof Filterlist
    >;
  }

  getFilterlistNode(): ReactElement<
  ComponentParams<Item, Additional, ErrorType, FiltersAndSortData>,
  typeof Filterlist
  > {
    return this.wrapper;
  }

  getFilterlistProps(): ComponentParams<Item, Additional, ErrorType, FiltersAndSortData> {
    return this.getFilterlistNode().props;
  }

  renderTestComponentNode(filterlistProps: ComponentRenderProps<any, any, any>): ReactElement {
    const {
      children: renderContent,
    } = this.getFilterlistProps();

    const renderedContent = renderContent(filterlistProps);

    return renderedContent as ReactElement;
  }

  getChildProps(filterlistProps: ComponentRenderProps<any, any, any>): Record<string, any> {
    const testComponentNode = this.renderTestComponentNode(filterlistProps);

    return testComponentNode.props;
  }
}

const setup = <Item, Additional, ErrorType, FiltersAndSortData>(
  options: Partial<HOCParams<Item, Additional, ErrorType>>,
  props: any,
): PageObject<Item, Additional, ErrorType, FiltersAndSortData> => new PageObject(options, props);

test('should provide options from decorator', () => {
  const page = setup(
    {
      loadItems: jest.fn(),

      appliedFilters: {
        filter1: 'value1',
      },

      alwaysResetFilters: {
        filter2: 'value2',
      },
    },
    {},
  );

  const filterlistProps = page.getFilterlistProps();

  expect(filterlistProps.appliedFilters).toEqual({
    filter1: 'value1',
  });
  expect(filterlistProps.alwaysResetFilters).toEqual({
    filter2: 'value2',
  });
});

test('should set filtersAndSortData as component props', () => {
  const page = setup({}, {
    param1: 'value1',
    param2: 'value2',
  });

  expect(page.getFilterlistProps().filtersAndSortData).toEqual({
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

  const listState: ListState<any, any, any> = {
    sort: {
      asc: true,
      param: '',
    },

    filters: {},
    appliedFilters: {},
    loading: false,
    items: [],
    loadedPages: 1,
    additional: null,
    error: null,
    shouldClean: false,
    isFirstLoad: false,
  };

  page.getFilterlistProps().loadItems(listState);

  expect(loadItems.mock.calls.length).toBe(1);
  expect(loadItems.mock.calls[0][0]).toBe(listState);
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

  const listState: ListState<any, any, any> = {
    sort: {
      asc: true,
      param: '',
    },

    filters: {},
    appliedFilters: {},
    loading: false,
    items: [],
    loadedPages: 1,
    additional: null,
    error: null,
    shouldClean: false,
    isFirstLoad: false,
  };

  const {
    onChangeLoadParams: onChangeLoadParamsHandler,
  } = page.getFilterlistProps();

  if (!onChangeLoadParamsHandler) {
    throw new Error('`onChangeLoadParams` is not defined');
  }

  onChangeLoadParamsHandler(listState);

  expect(onChangeLoadParams.mock.calls.length).toBe(1);
  expect(onChangeLoadParams.mock.calls[0][0]).toBe(listState);
  expect(onChangeLoadParams.mock.calls[0][1]).toEqual({
    param1: 'value1',
    param2: 'value2',
  });
});

test('should not provide onChangeLoadParams if not defined in options', () => {
  const page = setup({}, {});

  expect(page.getFilterlistProps().onChangeLoadParams).toBeFalsy();
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
