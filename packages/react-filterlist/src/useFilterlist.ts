/**
 * Experimental feature
 * TO DO: add tests
 */

import { useState, useEffect, useRef } from 'react';
import Filterlist, {
  eventTypes,
  ItemsLoader,
  ListState,
} from '@vtaits/filterlist';
import isPromise from 'is-promise';

import defaultShouldRecount from './defaultShouldRecount';

import {
  Params,
  AsyncParams,
  ParsedFiltersAndSort,
  AsyncParsedFiltersAndSort,
  OnChangeLoadParams,
} from './types';

type SyncListState = () => void;

const getFilterlistOptions = <Item, Additional, Error>(
  params: Params<Item, Additional, Error>,
  loadItems: ItemsLoader<Item, Additional, Error>,
): Params<Item, Additional, Error> | AsyncParams<Item, Additional, Error> => {
  const {
    parseFiltersAndSort = null,
    filtersAndSortData = null,
  } = params;

  if (parseFiltersAndSort) {
    const parseResult = parseFiltersAndSort(filtersAndSortData);

    if (isPromise(parseResult)) {
      return (parseResult as AsyncParsedFiltersAndSort)
        .then((parsedFiltersAndSort) => ({
          ...params,
          ...parsedFiltersAndSort,
          loadItems,
        }));
    }

    return {
      ...params,
      ...(parseResult as ParsedFiltersAndSort),
      loadItems,
    };
  }

  return {
    ...params,
    loadItems,
  };
};

const createFilterlist = <Item, Additional, Error>(
  options: Params<Item, Additional, Error>,
  syncListState: SyncListState,
  onChangeLoadParams: OnChangeLoadParams<Item, Additional, Error>,
): Filterlist<Item, Additional, Error> => {
  const filterlist = new Filterlist<Item, Additional, Error>(options);

  filterlist.emitter.addListener(eventTypes.changeListState, syncListState);
  filterlist.emitter.addListener(eventTypes.changeLoadParams, onChangeLoadParams);

  return filterlist;
};

const initFilterlist = <Item = any, Additional = any, Error = any>(
  params: Params<Item, Additional, Error>,
  loadItems: ItemsLoader<Item, Additional, Error>,
  syncListState: SyncListState,
  onChangeLoadParams: OnChangeLoadParams<Item, Additional, Error>,
): Filterlist<Item, Additional, Error> | Promise<Filterlist<Item, Additional, Error>> => {
  const optionsResult = getFilterlistOptions(params, loadItems);

  if (isPromise(optionsResult)) {
    return (<AsyncParams<Item, Additional, Error>>optionsResult)
      .then((options) => createFilterlist(options, syncListState, onChangeLoadParams));
  }

  return createFilterlist(
    (<Params<Item, Additional, Error>>optionsResult),
    syncListState,
    onChangeLoadParams,
  );
};

const useFilterlist = <
  Item = any,
  Additional = any,
  Error = any
>(
  params: Params<Item, Additional, Error>,
  inputs: any[] = [],
): [null | ListState<Item, Additional, Error>, Filterlist<Item, Additional, Error>] => {
  const {
    parseFiltersAndSort = null,
    filtersAndSortData = null,
    shouldRecount = defaultShouldRecount,
    onChangeLoadParams = null,
    loadItems,
    canInit = true,
  } = params;

  const loadItemsRef = useRef<ItemsLoader<Item, Additional, Error>>(null);
  loadItemsRef.current = loadItems;
  const loadItemsProxy = (nextListState) => loadItemsRef.current(nextListState);

  const onChangeLoadParamsRef = useRef<OnChangeLoadParams<Item, Additional, Error>>(
    <OnChangeLoadParams<Item, Additional, Error>>Function.prototype,
  );
  onChangeLoadParamsRef.current = onChangeLoadParams;

  const onChangeLoadParamsProxy = (nextListState) => {
    if (onChangeLoadParams) {
      onChangeLoadParamsRef.current(nextListState);
    }
  };

  let setListState;

  const isInitInProgressRef = useRef(false);
  const filterlistRef = useRef<Filterlist<Item, Additional, Error>>(null);

  const syncListState = (): void => {
    setListState(
      filterlistRef.current
        ? filterlistRef.current.getListState()
        : null,
    );
  };

  const initFilterlistInComponent = (isInEffect): void => {
    if (!filterlistRef.current && !isInitInProgressRef.current) {
      const filterlistResult = initFilterlist(
        params,
        loadItemsProxy,
        syncListState,
        onChangeLoadParamsProxy,
      );

      if (isPromise(filterlistResult)) {
        isInitInProgressRef.current = true;

        (<Promise<Filterlist<Item, Additional, Error>>>filterlistResult)
          .then((filterlist) => {
            filterlistRef.current = filterlist;
            isInitInProgressRef.current = false;

            setListState(filterlist.getListState());
          });
      } else {
        filterlistRef.current = (<Filterlist<Item, Additional, Error>>filterlistResult);
      }
    }

    if (isInEffect) {
      syncListState();
    }
  };

  if (canInit) {
    initFilterlistInComponent(false);
  }

  const [listState, setListStateHandler] = useState<null | ListState<Item, Additional, Error>>(
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
      return <() => void>Function.prototype;
    }

    initFilterlistInComponent(true);

    return () => {
      if (filterlistRef.current) {
        filterlistRef.current.emitter.removeAllListeners(eventTypes.changeListState);
        filterlistRef.current.emitter.removeAllListeners(eventTypes.changeLoadParams);
      }

      filterlistRef.current = null;
      isInitInProgressRef.current = false;
    };
  }, [...inputs, canInit]);

  return [listState, filterlistRef.current];
};

export default useFilterlist;
