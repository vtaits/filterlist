/* eslint-disable react/no-multi-comp, jsx-a11y/label-has-associated-control */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  createFilterlist,
  createListStateShape,
  listActionsShape,
} from '@vtaits/react-filterlist';

import Paginator from './Paginator';
import Th from './Th';

import * as api from './api';

class List extends Component {
  constructor(props) {
    super(props);

    this.setBrand = this.setInputFilterValue.bind(this, 'brand');
    this.applyBrand = this.applyFilter.bind(this, 'brand');
    this.resetBrand = this.resetFilter.bind(this, 'brand');

    this.setOwner = this.setInputFilterValue.bind(this, 'owner');
    this.applyOwner = this.applyFilter.bind(this, 'owner');
    this.resetOwner = this.resetFilter.bind(this, 'owner');

    this.toggleHideYellow = this.toggleCheckbox.bind(this, 'hideYellow');
    this.toggleHideRed = this.toggleCheckbox.bind(this, 'hideRed');
    this.toggleHideBlue = this.toggleCheckbox.bind(this, 'hideBlue');

    this.hideAllColors = this.hideAllColors.bind(this);
    this.resetAllColors = this.resetAllColors.bind(this);

    this.setPerPage = this.setPerPage.bind(this);
    this.setPage = this.setPage.bind(this);
  }

  setInputFilterValue(filterName, { target: { value } }) {
    const {
      listActions: {
        setFilterValue,
      },
    } = this.props;

    setFilterValue(filterName, value);
  }

  setPerPage({ target: { value } }) {
    const {
      listActions: {
        setAndApplyFilter,
      },
    } = this.props;

    setAndApplyFilter('perPage', Number(value));
  }

  setPage(page) {
    const {
      listActions: {
        setAndApplyFilter,
      },
    } = this.props;

    setAndApplyFilter('page', page);
  }

  applyFilter(filterName) {
    const {
      listActions: {
        applyFilter,
      },
    } = this.props;

    applyFilter(filterName);
  }

  resetFilter(filterName) {
    const {
      listActions: {
        resetFilter,
      },
    } = this.props;

    resetFilter(filterName);
  }

  toggleCheckbox(filterName) {
    const {
      listState: {
        appliedFilters,
      },

      listActions: {
        setAndApplyFilter,
      },
    } = this.props;

    setAndApplyFilter(filterName, !appliedFilters[filterName]);
  }

  hideAllColors() {
    const {
      listActions: {
        setAndApplyFilters,
      },
    } = this.props;

    setAndApplyFilters({
      hideYellow: true,
      hideRed: true,
      hideBlue: true,
    });
  }

  resetAllColors() {
    const {
      listActions: {
        resetFilters,
      },
    } = this.props;

    resetFilters(['hideYellow', 'hideRed', 'hideBlue']);
  }

  render() {
    const {
      isListInited,
      listState,
      listActions,
    } = this.props;

    if (!isListInited) {
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

    const {
      setSorting,
      resetAllFilters,
    } = listActions;

    return (
      <div>
        <div>
          <p>
            Brand:
            {' '}
            <input
              value={filters.brand || ''}
              onChange={this.setBrand}
            />
            {' '}
            <button
              type="button"
              onClick={this.applyBrand}
            >
              Apply
            </button>
            {' '}
            <button
              type="button"
              onClick={this.resetBrand}
            >
              Reset
            </button>
          </p>

          <p>
            Owner:
            {' '}
            <input
              value={filters.owner || ''}
              onChange={this.setOwner}
            />
            {' '}
            <button
              type="button"
              onClick={this.applyOwner}
            >
              Apply
            </button>
            {' '}
            <button
              type="button"
              onClick={this.resetOwner}
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
                  onChange={this.toggleHideYellow}
                />

                Hide yellow
              </label>
            </p>

            <p>
              <label>
                <input
                  type="checkbox"
                  checked={filters.hideRed || false}
                  onChange={this.toggleHideRed}
                />

                Hide red
              </label>
            </p>

            <p>
              <label>
                <input
                  type="checkbox"
                  checked={filters.hideBlue || false}
                  onChange={this.toggleHideBlue}
                />

                Hide blue
              </label>
            </p>

            <p>
              <button
                type="button"
                onClick={this.hideAllColors}
              >
                Check all checkboxes
              </button>
              {' '}
              <button
                type="button"
                onClick={this.resetAllColors}
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
            onChange={this.setPerPage}
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

              setPage={this.setPage}
            />
          )
        }
      </div>
    );
  }
}

List.propTypes = {
  isListInited: PropTypes.bool.isRequired,
  listState: createListStateShape({}),
  listActions: listActionsShape,
};

List.defaultProps = {
  listState: null,
  listActions: null,
};

export default createFilterlist({
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

  onChangeLoadParams: (newListState, { history }) => {
    const newQuery = qs.stringify({
      ...newListState.appliedFilters,
      hideYellow: newListState.appliedFilters.hideYellow ? 1 : undefined,
      hideRed: newListState.appliedFilters.hideRed ? 1 : undefined,
      hideBlue: newListState.appliedFilters.hideBlue ? 1 : undefined,
      sort: newListState.sort.param
        ? `${newListState.sort.asc ? '' : '-'}${newListState.sort.param}`
        : null,
    });

    history.push(`/?${newQuery}`);
  },

  alwaysResetFilters: {
    page: 1,
  },

  resetFiltersTo: {
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

  shouldRecount: ({
    history,
    location,
  }, prevProps) => history.action === 'POP'
    && location.search !== prevProps.location.search,

  isRecountAsync: true,
})(List);
