import React, {
  useCallback,
  ElementType,
  ReactNode,
} from 'react';

import {
  ItemsLoader,
  ListState,
} from '@vtaits/filterlist';

import Filterlist from './Filterlist';

import {
  HOCParams,
  ComponentRenderProps,
} from './types';

const createFilterlist = <
  Item = any,
  Additional = any,
  Error = any
>(options: HOCParams<Item, Additional, Error>) => {
  const {
    loadItems: loadItemsOption,
    onChangeLoadParams: onChangeLoadParamsOption,
  } = options;

  return (WrappedComponent: ElementType): ElementType => {
    const WithFilterlist = (props) => {
      const onChangeLoadParams = useCallback((
        nextListState: ListState<Item, Additional, Error>,
      ): void => {
        onChangeLoadParamsOption(nextListState, props);
      }, [onChangeLoadParamsOption]);

      const loadItems: ItemsLoader<Item, Additional, Error> = (
        listState: ListState<Item, Additional, Error>,
      ) => loadItemsOption(listState, props);

      const renderContent = (
        filterlistProps: ComponentRenderProps<Item, Additional, Error>,
      ): ReactNode => React.createElement(
        WrappedComponent,
        {
          ...props,
          ...filterlistProps,
        },
      );

      return React.createElement(
        Filterlist,
        {
          ...options,
          loadItems,
          filtersAndSortData: props,
          onChangeLoadParams: options.onChangeLoadParams && onChangeLoadParams,
        },
        renderContent,
      );
    };

    return WithFilterlist;
  };
};

export default createFilterlist;
