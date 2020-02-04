import { EventEmitter } from 'fbemitter';

const mockedMethods = [
  'loadItems',
  'setFilterValue',
  'applyFilter',
  'setAndApplyFilter',
  'resetFilter',
  'setFiltersValues',
  'applyFilters',
  'setAndApplyFilters',
  'resetFilters',
  'resetAllFilters',
  'setSorting',
  'resetSorting',
  'setFiltersAndSorting',
  'insertItem',
  'deleteItem',
  'updateItem',
];

class Filterlist extends EventEmitter {
  constructor(...args) {
    super(...args);

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
  loadItems: 'loadItems',
  setFilterValue: 'setFilterValue',
  applyFilter: 'applyFilter',
  setAndApplyFilter: 'setAndApplyFilter',
  resetFilter: 'resetFilter',
  setFiltersValues: 'setFiltersValues',
  applyFilters: 'applyFilters',
  setAndApplyFilters: 'setAndApplyFilters',
  resetFilters: 'resetFilters',
  resetAllFilters: 'resetAllFilters',
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

export default Filterlist;
