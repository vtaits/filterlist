import type {
  ComponentListActions,
} from '../src/types';

const listActions: ComponentListActions = {
  loadMore: async () => {},
  setFilterValue: () => {},
  applyFilter: async () => {},
  setAndApplyFilter: async () => {},
  resetFilter: async () => {},
  setFiltersValues: () => {},
  applyFilters: async () => {},
  setAndApplyFilters: async () => {},
  resetFilters: async () => {},
  resetAllFilters: async () => {},
  setSorting: async () => {},
  resetSorting: async () => {},
  insertItem: () => {},
  deleteItem: () => {},
  updateItem: () => {},
};

export default listActions;
