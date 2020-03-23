/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import qs from 'qs';

import Filterlist, { eventTypes } from '@vtaits/filterlist';

import Paginator from './Paginator';
import Th from './Th';

import * as api from './api';

function getStateFromSearch(search) {
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
}

async function loadItems({
  sort,
  appliedFilters,
}) {
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
}

class List extends Component {
  constructor(props) {
    super(props);

    this.syncListState = this.syncListState.bind(this);

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

    this.resetAllFilters = this.resetAllFilters.bind(this);
    this.setSorting = this.setSorting.bind(this);

    this.onChangeListState = this.onChangeListState.bind(this);

    const {
      location: {
        search,
      },
    } = props;

    const stateFromSearch = getStateFromSearch(search);

    this.filterlist = new Filterlist({
      alwaysResetFilters: {
        page: 1,
      },

      resetFiltersTo: {
        perPage: 10,
      },

      saveFiltersOnResetAll: ['perPage'],

      loadItems,

      ...stateFromSearch,
    });

    this.filterlist.emitter.addListener(eventTypes.changeListState, this.syncListState);
    this.filterlist.emitter.addListener(eventTypes.changeLoadParams, this.onChangeListState);

    this.state = {
      listState: this.filterlist.getListState(),
    };
  }

  componentDidUpdate(prevProps) {
    const {
      history,
      location,
    } = this.props;

    if (
      history.action === 'POP'
      && location.search !== prevProps.location.search
    ) {
      const stateFromSearch = getStateFromSearch(location.search);

      this.filterlist.setFiltersAndSorting(stateFromSearch);
    }
  }

  componentWillUnmount() {
    this.filterlist.emitter.removeAllListeners(eventTypes.changeListState);
    this.filterlist.emitter.removeAllListeners(eventTypes.changeLoadParams);
  }

  onChangeListState(newListState) {
    const {
      history,
    } = this.props;

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
  }

  setPage(page) {
    this.filterlist.setAndApplyFilter('page', page);
  }

  setPerPage({ target: { value } }) {
    this.filterlist.setAndApplyFilter('perPage', Number(value));
  }

  setInputFilterValue(filterName, { target: { value } }) {
    this.filterlist.setFilterValue(filterName, value);
  }

  setSorting(paramName, asc) {
    this.filterlist.setSorting(paramName, asc);
  }

  resetAllFilters() {
    this.filterlist.resetAllFilters();
  }

  toggleCheckbox(filterName) {
    const {
      listState: {
        appliedFilters,
      },
    } = this.state;

    this.filterlist.setAndApplyFilter(filterName, !appliedFilters[filterName]);
  }

  hideAllColors() {
    this.filterlist.setAndApplyFilters({
      hideYellow: true,
      hideRed: true,
      hideBlue: true,
    });
  }

  resetAllColors() {
    this.filterlist.resetFilters(['hideYellow', 'hideRed', 'hideBlue']);
  }

  resetFilter(filterName) {
    this.filterlist.resetFilter(filterName);
  }

  applyFilter(filterName) {
    this.filterlist.applyFilter(filterName);
  }

  syncListState() {
    this.setState({
      listState: this.filterlist.getListState(),
    });
  }

  render() {
    const {
      listState: {
        additional,
        items,
        loading,

        sort,

        filters,

        appliedFilters: {
          page,
          perPage,
        },
      },
    } = this.state;

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
            onClick={this.resetAllFilters}
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
                setSorting={this.setSorting}
              >
                id
              </Th>

              <Th
                param="brand"
                current={sort.param}
                asc={sort.asc}
                setSorting={this.setSorting}
              >
                brand
              </Th>

              <Th
                param="owner"
                current={sort.param}
                asc={sort.asc}
                setSorting={this.setSorting}
              >
                owner
              </Th>

              <Th
                param="color"
                current={sort.param}
                asc={sort.asc}
                setSorting={this.setSorting}
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
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    action: PropTypes.string,
  }).isRequired,

  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

export default List;
