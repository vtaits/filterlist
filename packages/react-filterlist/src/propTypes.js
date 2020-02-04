import PropTypes from 'prop-types';

const sortShape = PropTypes.shape({
  param: PropTypes.string,
  asc: PropTypes.bool.isRequired,
});

export function createListStatePropTypes(listStateConfig) {
  if (typeof listStateConfig !== 'object') {
    throw new Error('List state config should be an object');
  }

  if (listStateConfig === null) {
    throw new Error('List state config can\'t be null');
  }

  const {
    item = PropTypes.any,
    filters = PropTypes.object,
    additional = PropTypes.any,
    error = PropTypes.any,
  } = listStateConfig;

  return {
    sort: sortShape.isRequired,
    filters: filters.isRequired,
    appliedFilters: filters.isRequired,
    loading: PropTypes.bool.isRequired,
    items: PropTypes.arrayOf(item).isRequired,
    additional,
    error,
  };
}

export function createListStateShape(listStateConfig) {
  const listStatePropTypes = createListStatePropTypes(listStateConfig);

  return PropTypes.shape(listStatePropTypes);
}

export const listActionsPropTypes = {
  loadItems: PropTypes.func.isRequired,

  setFilterValue: PropTypes.func.isRequired,
  applyFilter: PropTypes.func.isRequired,
  setAndApplyFilter: PropTypes.func.isRequired,
  resetFilter: PropTypes.func.isRequired,

  setFiltersValues: PropTypes.func.isRequired,
  applyFilters: PropTypes.func.isRequired,
  setAndApplyFilters: PropTypes.func.isRequired,
  resetFilters: PropTypes.func.isRequired,

  resetAllFilters: PropTypes.func.isRequired,

  setSorting: PropTypes.func.isRequired,
  resetSorting: PropTypes.func.isRequired,

  insertItem: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  updateItem: PropTypes.func.isRequired,
};

export const listActionsShape = PropTypes.shape(listActionsPropTypes);
