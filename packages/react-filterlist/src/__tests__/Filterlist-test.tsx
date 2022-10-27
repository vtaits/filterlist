/* eslint-disable max-classes-per-file */

import React from 'react';
import type {
  ReactNode,
} from 'react';

import { shallow } from 'enzyme';
import type {
  ShallowWrapper,
} from 'enzyme';

import type {
  EventType,
  ListState,
  Params,
} from '@vtaits/filterlist';

import Filterlist from '../Filterlist';
import type {
  State,
} from '../Filterlist';
import type {
  ComponentParams,
  ParseFiltersAndSort,
} from '../types';

const methodsForChild: [EventType, number][] = [
  ['loadMore', 0],
  ['setFilterValue', 2],
  ['applyFilter', 1],
  ['setAndApplyFilter', 2],
  ['resetFilter', 1],
  ['setFiltersValues', 1],
  ['applyFilters', 1],
  ['setAndApplyFilters', 1],
  ['resetFilters', 1],
  ['resetAllFilters', 0],
  ['reload', 0],
  ['setSorting', 2],
  ['resetSorting', 0],
  ['insertItem', 3],
  ['deleteItem', 2],
  ['updateItem', 3],
];

class ManualFilterlist<
Item,
Additional,
Error,
FiltersAndSortData,
> extends Filterlist<Item, Additional, Error, FiltersAndSortData> {
  constructor(props) {
    super(props);

    this.initFilterlistAsync = jest.fn();
  }

  manualInitFilterlistAsync(): Promise<void> {
    return super.initFilterlistAsync();
  }

  componentDidUpdate(): Promise<void> {
    return Promise.resolve();
  }

  manualComponentDidUpdate(
    prevProps: ComponentParams<Item, Additional, Error, FiltersAndSortData>,
  ): Promise<void> {
    return super.componentDidUpdate(prevProps);
  }
}

function TestComponent() {
  return null;
}

const defaultProps = {
  loadItems: Function.prototype,
  children: (props): ReactNode => <TestComponent {...props} />,
};

const parseFiltersAndSort: ParseFiltersAndSort<any> = ({
  filtersRaw,
  appliedFiltersRaw,
  sortRaw,
}) => ({
  filters: filtersRaw,
  appliedFilters: appliedFiltersRaw,
  sort: sortRaw,
});

class PageObject {
  wrapper: ShallowWrapper<
  ComponentParams<any, any, any, any>,
  State<any, any, any>,
  ManualFilterlist<any, any, any, any>>;

  constructor(props) {
    this.wrapper = shallow(
      <ManualFilterlist
        {...defaultProps}
        {...props}
      />,
    );
  }

  async setProps(newProps): Promise<void> {
    const oldProps = this.instance().props;

    this.wrapper.setProps(newProps);

    await this.instance().manualComponentDidUpdate(oldProps);
  }

  update(): void {
    this.wrapper.update();
  }

  instance(): ManualFilterlist<any, any, any, any> {
    return this.wrapper.instance();
  }

  componentDidUpdate(): Promise<void> {
    return this.instance().manualComponentDidUpdate(this.wrapper.props());
  }

  callLoadItems(...args): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.instance().filterlist.constructorArgs[0].loadItems(...args);
  }

  getTestComponentNode(): ShallowWrapper {
    return this.wrapper.find(TestComponent);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  getListAction(actionName): Function {
    const testComponentNode = this.getTestComponentNode();

    const listActions = testComponentNode.prop('listActions');

    return listActions[actionName];
  }

  checkListInitied(): boolean {
    const testComponentNode = this.getTestComponentNode();

    return testComponentNode.prop('isListInited');
  }

  getListState(): ListState<any, any, any> {
    const testComponentNode = this.getTestComponentNode();

    return testComponentNode.prop('listState');
  }

  getFilterlistInstance(): any {
    return this.instance().filterlist;
  }

  getFilterlistOptions(): Params<any, any, any> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.getFilterlistInstance().constructorArgs[0];
  }
}

const setup = (props): PageObject => new PageObject(props);

test('should provide list state to child', () => {
  const page = setup({});

  expect(page.checkListInitied()).toBe(true);
  expect(page.getListState()).toEqual({
    isMockedState: true,
  });
});

methodsForChild.forEach(([methodName, argsCount]) => {
  test(`should call "${methodName}" from rendered component`, () => {
    const page = setup({});

    const method = page.getListAction(methodName);

    method('arg1', 'arg2', 'arg3', 'arg4');

    const filterlist = page.getFilterlistInstance();

    expect(filterlist[methodName]).toHaveBeenCalledTimes(1);
    expect(filterlist[methodName].mock.calls[0].slice(0, argsCount))
      .toEqual(['arg1', 'arg2', 'arg3', 'arg4'].slice(0, argsCount));
  });
});

test('should init with parsed filters and sort', () => {
  const page = setup({
    parseFiltersAndSort,

    filtersAndSortData: {
      filtersRaw: {
        filter1: 'value1',
      },

      appliedFiltersRaw: {
        filter1: 'value2',
      },

      sortRaw: {
        param: 'test',
        asc: true,
      },
    },
  });

  const options = page.getFilterlistOptions();

  expect(options.appliedFilters).toEqual({
    filter1: 'value2',
  });

  expect(options.sort).toEqual({
    param: 'test',
    asc: true,
  });
});

test('should call shouldRecount on update', async () => {
  const shouldRecount = jest.fn();

  const page = setup({
    parseFiltersAndSort,
    shouldRecount,

    filtersAndSortData: {
      filtersRaw: {
        filter1: 'value1',
      },

      appliedFiltersRaw: {
        filter1: 'value2',
      },

      sortRaw: {
        param: 'test',
        asc: true,
      },
    },
  });

  await page.setProps({
    filtersAndSortData: {
      filtersRaw: {
        filter1: 'value3',
      },

      appliedFiltersRaw: {
        filter1: 'value4',
      },

      sortRaw: {
        param: 'test2',
        asc: false,
      },
    },
  });

  expect(shouldRecount).toHaveBeenCalledTimes(1);
  expect(shouldRecount.mock.calls[0][0]).toEqual({
    filtersRaw: {
      filter1: 'value3',
    },

    appliedFiltersRaw: {
      filter1: 'value4',
    },

    sortRaw: {
      param: 'test2',
      asc: false,
    },
  });
  expect(shouldRecount.mock.calls[0][1]).toEqual({
    filtersRaw: {
      filter1: 'value1',
    },

    appliedFiltersRaw: {
      filter1: 'value2',
    },

    sortRaw: {
      param: 'test',
      asc: true,
    },
  });
});

test('should not call setFiltersAndSorting if shouldRecount returns false', async () => {
  const page = setup({
    parseFiltersAndSort,
    shouldRecount: () => false,

    filtersAndSortData: {
      filtersRaw: {
        filter1: 'value1',
      },

      appliedFiltersRaw: {
        filter1: 'value2',
      },

      sortRaw: {
        param: 'test',
        asc: true,
      },
    },
  });

  await page.setProps({
    filtersAndSortData: {
      filtersRaw: {
        filter1: 'value3',
      },

      appliedFiltersRaw: {
        filter1: 'value4',
      },

      sortRaw: {
        param: 'test2',
        asc: false,
      },
    },
  });

  const filterlist = page.getFilterlistInstance();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(filterlist.setFiltersAndSorting).toHaveBeenCalledTimes(0);
});

test('should call setFiltersAndSorting if shouldRecount returns true', async () => {
  const page = setup({
    parseFiltersAndSort,
    shouldRecount: () => true,

    filtersAndSortData: {
      filtersRaw: {
        filter1: 'value1',
      },

      appliedFiltersRaw: {
        filter1: 'value2',
      },

      sortRaw: {
        param: 'test',
        asc: true,
      },
    },
  });

  await page.setProps({
    filtersAndSortData: {
      filtersRaw: {
        filter1: 'value3',
      },

      appliedFiltersRaw: {
        filter1: 'value4',
      },

      sortRaw: {
        param: 'test2',
        asc: false,
      },
    },
  });

  const filterlist = page.getFilterlistInstance();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(filterlist.setFiltersAndSorting).toHaveBeenCalledTimes(1);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(filterlist.setFiltersAndSorting.mock.calls[0][0]).toEqual({
    filters: {
      filter1: 'value3',
    },

    appliedFilters: {
      filter1: 'value4',
    },

    sort: {
      param: 'test2',
      asc: false,
    },
  });
});

test('should set not inited list state for async init', () => {
  const page = setup({
    parseFiltersAndSort: Function.prototype,
    isRecountAsync: true,
  });

  expect(page.checkListInitied()).toBe(false);
  expect(page.getListState()).toEqual(null);
});

test('should init asynchronously with parsed filters and sort', async () => {
  const page = setup({
    parseFiltersAndSort: async (data) => {
      const parsed = await parseFiltersAndSort(data);

      return parsed;
    },

    filtersAndSortData: {
      filtersRaw: {
        filter1: 'value1',
      },

      appliedFiltersRaw: {
        filter1: 'value2',
      },

      sortRaw: {
        param: 'test',
        asc: true,
      },
    },
  });

  await page.instance().manualInitFilterlistAsync();

  const options = page.getFilterlistOptions();

  expect(options.appliedFilters).toEqual({
    filter1: 'value2',
  });

  expect(options.sort).toEqual({
    param: 'test',
    asc: true,
  });

  expect(page.checkListInitied()).toBe(true);
  expect(page.getListState()).toEqual({
    isMockedState: true,
  });
});

test('should call asynchronously setFiltersAndSorting if shouldRecount returns true', async () => {
  const page = setup({
    parseFiltersAndSort,
    shouldRecount: async (data) => {
      const parsed = await parseFiltersAndSort(data);

      return parsed;
    },

    filtersAndSortData: {
      filtersRaw: {
        filter1: 'value1',
      },

      appliedFiltersRaw: {
        filter1: 'value2',
      },

      sortRaw: {
        param: 'test',
        asc: true,
      },
    },
  });

  await page.setProps({
    filtersAndSortData: {
      filtersRaw: {
        filter1: 'value3',
      },

      appliedFiltersRaw: {
        filter1: 'value4',
      },

      sortRaw: {
        param: 'test2',
        asc: false,
      },
    },
  });

  const filterlist = page.getFilterlistInstance();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(filterlist.setFiltersAndSorting).toHaveBeenCalledTimes(1);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(filterlist.setFiltersAndSorting.mock.calls[0][0]).toEqual({
    filters: {
      filter1: 'value3',
    },

    appliedFilters: {
      filter1: 'value4',
    },

    sort: {
      param: 'test2',
      asc: false,
    },
  });
});

test('should call onChangeLoadParams on "changeLoadParams" event', () => {
  const onChangeLoadParams = jest.fn();

  const page = setup({
    onChangeLoadParams,
  });

  page.getFilterlistInstance().emitter.emit('changeLoadParams', 'new list state');

  expect(onChangeLoadParams).toHaveBeenCalledTimes(1);
  expect(onChangeLoadParams.mock.calls[0][0]).toBe('new list state');
});

test('should different loadItems from different props', async () => {
  const loadItems1 = jest.fn();
  const loadItems2 = jest.fn();

  const page = setup({
    loadItems: loadItems1,
  });

  await page.callLoadItems('test1');

  expect(loadItems1).toHaveBeenCalledTimes(1);
  expect(loadItems1.mock.calls[0][0]).toBe('test1');

  await page.setProps({
    loadItems: loadItems2,
  });

  await page.callLoadItems('test2');

  expect(loadItems1).toHaveBeenCalledTimes(1);
  expect(loadItems2).toHaveBeenCalledTimes(1);
  expect(loadItems2.mock.calls[0][0]).toBe('test2');
});

test('should different loadItems from different props in case with parseFiltersAndSort', async () => {
  const loadItems1 = jest.fn();
  const loadItems2 = jest.fn();

  const page = setup({
    parseFiltersAndSort,
    filtersAndSortData: {},
    loadItems: loadItems1,
  });

  await page.callLoadItems('test1');

  expect(loadItems1).toHaveBeenCalledTimes(1);
  expect(loadItems1.mock.calls[0][0]).toBe('test1');

  await page.setProps({
    loadItems: loadItems2,
  });

  await page.callLoadItems('test2');

  expect(loadItems1).toHaveBeenCalledTimes(1);
  expect(loadItems2).toHaveBeenCalledTimes(1);
  expect(loadItems2.mock.calls[0][0]).toBe('test2');
});

test('should different loadItems from different props in case with parseFiltersAndSort and async init', async () => {
  const loadItems1 = jest.fn();
  const loadItems2 = jest.fn();

  const page = setup({
    parseFiltersAndSort,
    filtersAndSortData: {},
    isRecountAsync: true,
    loadItems: loadItems1,
  });

  await page.instance().manualInitFilterlistAsync();

  await page.callLoadItems('test1');

  expect(loadItems1).toHaveBeenCalledTimes(1);
  expect(loadItems1.mock.calls[0][0]).toBe('test1');

  await page.setProps({
    loadItems: loadItems2,
  });

  await page.callLoadItems('test2');

  expect(loadItems1).toHaveBeenCalledTimes(1);
  expect(loadItems2).toHaveBeenCalledTimes(1);
  expect(loadItems2.mock.calls[0][0]).toBe('test2');
});
