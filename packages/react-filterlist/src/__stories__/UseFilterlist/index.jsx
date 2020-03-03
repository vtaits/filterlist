/* eslint-disable jsx-a11y/label-has-associated-control */

import React from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';

// eslint-disable-next-line import/no-extraneous-dependencies
import { useFilterlist } from '@vtaits/react-filterlist';

import Paginator from './Paginator';
import Th from './Th';

import * as api from './api';

const List = (props) => {
  const [listState, filterlist] = useFilterlist({
    loadItems: async ({
      sort,
      appliedFilters,
    }) => {
      const response = await api.loadCars({
        ...appliedFilters,
        sort: `${sort.param ? `${sort.asc ? '' : '-'}${sort.param}` : ''}`,
      });

      return {
        items: response.cars,
        additional: {
          count: response.count,
        },
      };
    },

    onChangeLoadParams: (newListState) => {
      const newQuery = qs.stringify({
        ...newListState.appliedFilters,
        hideYellow: newListState.appliedFilters.hideYellow ? 1 : undefined,
        hideRed: newListState.appliedFilters.hideRed ? 1 : undefined,
        hideBlue: newListState.appliedFilters.hideBlue ? 1 : undefined,
        sort: newListState.sort.param
          ? `${newListState.sort.asc ? '' : '-'}${newListState.sort.param}`
          : null,
      });

      props.history.push(`${props.match.path}?${newQuery}`);
    },

    alwaysResetFilters: {
      page: 1,
    },

    initialFilters: {
      perPage: 10,
    },

    saveFiltersOnResetAll: ['perPage'],

    parseFiltersAndSort: async ({
      location: {
        search,
      },
    }) => {
      const parsed = qs.parse(search.substring(1, search.length));

      const {
        sort,
      } = parsed;

      const appliedFilters = {
        brand: parsed.brand || '',
        owner: parsed.owner || '',
        hideYellow: Boolean(parsed.hideYellow),
        hideRed: Boolean(parsed.hideRed),
        hideBlue: Boolean(parsed.hideBlue),
        page: parsed.page || 1,
        perPage: parsed.perPage || 10,
      };

      return {
        sort: {
          param: sort
            ? (
              sort[0] === '-'
                ? sort.substring(1, sort.length)
                : sort
            )
            : 'id',

          asc: !!sort && sort[0] !== '-',
        },

        filters: appliedFilters,
        appliedFilters,
      };
    },

    filtersAndSortData: props,

    shouldRecount: ({
      history,
      location,
    }, prevProps) => history.action === 'POP'
      && location.search !== prevProps.location.search,
  });

  const setBrand = ({ target: { value } }) => {
    filterlist.setFilterValue('brand', value);
  };

  const applyBrand = () => {
    filterlist.applyFilter('brand');
  };

  const resetBrand = () => {
    filterlist.resetFilter('brand');
  };

  const setOwner = ({ target: { value } }) => {
    filterlist.setFilterValue('owner', value);
  };

  const applyOwner = () => {
    filterlist.applyFilter('owner');
  };

  const resetOwner = () => {
    filterlist.resetFilter('owner');
  };

  const toggleHideYellow = () => {
    filterlist.setAndApplyFilter('hideYellow', !listState.appliedFilters.hideYellow);
  };

  const toggleHideRed = () => {
    filterlist.setAndApplyFilter('hideRed', !listState.appliedFilters.hideRed);
  };

  const toggleHideBlue = () => {
    filterlist.setAndApplyFilter('hideBlue', !listState.appliedFilters.hideBlue);
  };

  const hideAllColors = () => {
    filterlist.setAndApplyFilters({
      hideYellow: true,
      hideRed: true,
      hideBlue: true,
    });
  };

  const resetAllColors = () => {
    filterlist.resetFilters(['hideYellow', 'hideRed', 'hideBlue']);
  };

  const setPerPage = ({ target: { value } }) => {
    filterlist.setAndApplyFilter('perPage', Number(value));
  };

  const setPage = (page) => {
    filterlist.setAndApplyFilter('page', page);
  };

  const setSorting = (...args) => filterlist.setSorting(...args);
  const resetAllFilters = () => filterlist.resetAllFilters();

  if (!listState) {
    return null;
  }

  const {
    additional,
    items,
    loading,

    sort,

    filters,

    appliedFilters: {
      page,
      perPage,
    },
  } = listState;

  return (
    <div>
      <div>
        <p>
          Brand:
          {' '}
          <input
            value={filters.brand || ''}
            onChange={setBrand}
          />
          {' '}
          <button
            type="button"
            onClick={applyBrand}
          >
            Apply
          </button>
          {' '}
          <button
            type="button"
            onClick={resetBrand}
          >
            Reset
          </button>
        </p>

        <p>
          Owner:
          {' '}
          <input
            value={filters.owner || ''}
            onChange={setOwner}
          />
          {' '}
          <button
            type="button"
            onClick={applyOwner}
          >
            Apply
          </button>
          {' '}
          <button
            type="button"
            onClick={resetOwner}
          >
            Reset
          </button>
        </p>

        <div>
          <p>
            <label>
              <input
                type="checkbox"
                checked={filters.hideYellow || false}
                onChange={toggleHideYellow}
              />

              Hide yellow
            </label>
          </p>

          <p>
            <label>
              <input
                type="checkbox"
                checked={filters.hideRed || false}
                onChange={toggleHideRed}
              />

              Hide red
            </label>
          </p>

          <p>
            <label>
              <input
                type="checkbox"
                checked={filters.hideBlue || false}
                onChange={toggleHideBlue}
              />

              Hide blue
            </label>
          </p>

          <p>
            <button
              type="button"
              onClick={hideAllColors}
            >
              Check all checkboxes
            </button>
            {' '}
            <button
              type="button"
              onClick={resetAllColors}
            >
              Uncheck all checkboxes
            </button>
          </p>
        </div>
      </div>

      <p>
        <button
          type="button"
          onClick={resetAllFilters}
        >
          Reset all filters
        </button>
      </p>

      <table>
        <thead>
          <tr>
            <Th
              param="id"
              current={sort.param}
              asc={sort.asc}
              setSorting={setSorting}
            >
              id
            </Th>

            <Th
              param="brand"
              current={sort.param}
              asc={sort.asc}
              setSorting={setSorting}
            >
              brand
            </Th>

            <Th
              param="owner"
              current={sort.param}
              asc={sort.asc}
              setSorting={setSorting}
            >
              owner
            </Th>

            <Th
              param="color"
              current={sort.param}
              asc={sort.asc}
              setSorting={setSorting}
            >
              color
            </Th>
          </tr>
        </thead>

        <tbody>
          {
            items.map(({
              id,
              brand,
              owner,
              color,
            }) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{brand}</td>
                <td>{owner}</td>
                <td>{color}</td>
              </tr>
            ))
          }
        </tbody>
      </table>


      {
        additional && (
          <h4>
            Total:
              {' '}
            {additional.count}
          </h4>
        )
      }

      {
        loading && (
          <h3>Loading...</h3>
        )
      }

      <p>
        Items per page:
        {' '}
        <select
          value={perPage}
          onChange={setPerPage}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
        </select>
      </p>

      {
        additional && (
          <Paginator
            count={additional.count}
            perPage={perPage}
            current={page}

            setPage={setPage}
          />
        )
      }
    </div>
  );
};

List.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,

  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default List;
