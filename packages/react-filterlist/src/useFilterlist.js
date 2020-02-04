/**
 * Experimental feature
 * TO DO: add tests
 */

import { useState, useEffect, useRef } from 'react';
import Filterlist, { eventTypes } from '@vtaits/filterlist';
import isPromise from 'is-promise';

import defaultShouldRecount from './defaultShouldRecount';

const getFilterlistOptions = (params, loadItems) => {
  const {
    parseFiltersAndSort = null,
    filtersAndSortData = null,
  } = params;

  if (parseFiltersAndSort) {
    const parseResult = parseFiltersAndSort(filtersAndSortData);

    if (isPromise(parseResult)) {
      return parseResult
        .then((parsedFiltersAndSort) => ({
          ...params,
          ...parsedFiltersAndSort,
          loadItems,
        }));
    }

    return {
      ...params,
      ...parseResult,
      loadItems,
    };
  }

  return {
    ...params,
    loadItems,
  };
};

const createFilterlist = (options, syncListState, onChangeLoadParams) => {
  const filterlist = new Filterlist(options);

  filterlist.addListener(eventTypes.changeListState, syncListState);
  filterlist.addListener(eventTypes.changeLoadParams, onChangeLoadParams);

  return filterlist;
};

const initFilterlist = (params, loadItems, syncListState, onChangeLoadParams) => {
  const optionsResult = getFilterlistOptions(params, loadItems);

  if (isPromise(optionsResult)) {
    return optionsResult
      .then((options) => createFilterlist(options, syncListState, onChangeLoadParams));
  }

  return createFilterlist(optionsResult, syncListState, onChangeLoadParams);
};

const useFilterlist = (params, inputs = []) => {
  const {
    parseFiltersAndSort = null,
    filtersAndSortData = null,
    shouldRecount = defaultShouldRecount,
    onChangeLoadParams = null,
    loadItems,
    canInit = true,
  } = params;

  const loadItemsRef = useRef();
  loadItemsRef.current = loadItems;
  const loadItemsProxy = (nextListState) => loadItemsRef.current(nextListState);

  const onChangeLoadParamsRef = useRef(Function.prototype);
  onChangeLoadParamsRef.current = onChangeLoadParams;

  const onChangeLoadParamsProxy = (nextListState) => {
    if (onChangeLoadParams) {
      onChangeLoadParamsRef.current(nextListState);
    }
  };

  let setListState;

  const isInitInProgressRef = useRef(false);
  const filterlistRef = useRef(null);

  const syncListState = () => {
    setListState(
      filterlistRef.current
        ? filterlistRef.current.getListState()
        : null,
    );
  };

  const initFilterlistInComponent = (isInEffect) => {
    if (!filterlistRef.current && !isInitInProgressRef.current) {
      const filterlistResult = initFilterlist(
        params,
        loadItemsProxy,
        syncListState,
        onChangeLoadParamsProxy,
      );

      if (isPromise(filterlistResult)) {
        isInitInProgressRef.current = true;

        filterlistResult.then((filterlist) => {
          filterlistRef.current = filterlist;
          isInitInProgressRef.current = false;

          setListState(filterlist.getListState());
        });
      } else {
        filterlistRef.current = filterlistResult;
      }
    }

    if (isInEffect) {
      syncListState();
    }
  };

  if (canInit) {
    initFilterlistInComponent(false);
  }

  const [listState, setListStateHandler] = useState(
    filterlistRef.current && filterlistRef.current.getListState(),
  );
  setListState = setListStateHandler;

  const filtersAndSortDataRef = useRef(filtersAndSortData);
  if (
    parseFiltersAndSort
    && shouldRecount(filtersAndSortData, filtersAndSortDataRef.current)
  ) {
    (async () => {
      const parsedFiltersAndSort = await parseFiltersAndSort(filtersAndSortData);

      filterlistRef.current.setFiltersAndSorting(parsedFiltersAndSort);
    })();
  }
  filtersAndSortDataRef.current = filtersAndSortData;

  useEffect(() => {
    if (!canInit) {
      return Function.prototype;
    }

    initFilterlistInComponent(true);

    return () => {
      if (filterlistRef.current) {
        filterlistRef.current.removeAllListeners(eventTypes.changeListState);
        filterlistRef.current.removeAllListeners(eventTypes.onChangeLoadParams);
      }

      filterlistRef.current = null;
      isInitInProgressRef.current = false;
    };
  }, [...inputs, canInit]);

  return [listState, filterlistRef.current];
};

export default useFilterlist;
