import type {
  ComponentListActions,
} from '../src/types';

const listActions: ComponentListActions<any, any> = {
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
  reload: async () => {},
  setSorting: async () => {},
  resetSorting: async () => {},
  insertItem: () => {},
  deleteItem: () => {},
  updateItem: () => {},
};

export default listActions;
