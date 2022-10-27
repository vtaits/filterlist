import EventEmitter from 'events';

const mockedMethods = [
  'loadMore',
  'setFilterValue',
  'applyFilter',
  'setAndApplyFilter',
  'resetFilter',
  'setFiltersValues',
  'applyFilters',
  'setAndApplyFilters',
  'resetFilters',
  'resetAllFilters',
  'reload',
  'setSorting',
  'resetSorting',
  'setFiltersAndSorting',
  'insertItem',
  'deleteItem',
  'updateItem',
];

export class Filterlist {
  constructor(...args) {
    this.emitter = new EventEmitter();

    this.constructorArgs = args;

    mockedMethods.forEach((methodName) => {
      this[methodName] = jest.fn();
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getListState() {
    return {
      isMockedState: true,
    };
  }
}

export const eventTypes = {
  loadMore: 'loadMore',
  setFilterValue: 'setFilterValue',
  applyFilter: 'applyFilter',
  setAndApplyFilter: 'setAndApplyFilter',
  resetFilter: 'resetFilter',
  setFiltersValues: 'setFiltersValues',
  applyFilters: 'applyFilters',
  setAndApplyFilters: 'setAndApplyFilters',
  resetFilters: 'resetFilters',
  resetAllFilters: 'resetAllFilters',
  reload: 'reload',
  setSorting: 'setSorting',
  resetSorting: 'resetSorting',
  setFiltersAndSorting: 'setFiltersAndSorting',
  changeLoadParams: 'changeLoadParams',
  insertItem: 'insertItem',
  deleteItem: 'deleteItem',
  updateItem: 'updateItem',
  requestItems: 'requestItems',
  loadItemsSuccess: 'loadItemsSuccess',
  loadItemsError: 'loadItemsError',
  changeListState: 'changeListState',
};
