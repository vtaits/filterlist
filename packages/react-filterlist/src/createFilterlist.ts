import React, {
  useCallback,
} from 'react';
import type {
  ComponentType,
  ReactNode,
  FC,
} from 'react';

import type {
  ItemsLoader,
  ListState,
} from '@vtaits/filterlist';

import Filterlist from './Filterlist';

import type {
  HOCParams,
  ComponentRenderProps,
} from './types';

type HOCProps<
PermanentProps = Record<string, any>,
Item = any,
Additional = any,
Error = any
> =
  & Omit<PermanentProps, 'isListInited' | 'listState' | 'listActions'>
  & ComponentRenderProps<Item, Additional, Error>;

type HOC<
PermanentProps = Record<string, any>,
Item = any,
Additional = any,
Error = any
> = (
  WrappedComponent: ComponentType<HOCProps<PermanentProps, Item, Additional, Error>>
) => FC;

const createFilterlist = <
  PermanentProps = Record<string, any>,
  Item = any,
  Additional = any,
  Error = any
>(options: HOCParams<Item, Additional, Error>): HOC<PermanentProps, Item, Additional, Error> => {
  const {
    loadItems: loadItemsOption,
    onChangeLoadParams: onChangeLoadParamsOption,
  } = options;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  return (
    WrappedComponent: ComponentType<HOCProps<PermanentProps, Item, Additional, Error>>,
  ): FC<PermanentProps> => {
    const WithFilterlist: FC<PermanentProps> = (props) => {
      const onChangeLoadParams = useCallback((
        nextListState: ListState<Item, Additional, Error>,
      ): void => {
        onChangeLoadParamsOption(nextListState, props);
      }, [onChangeLoadParamsOption]);

      const loadItems: ItemsLoader<Item, Additional, Error> = (
        listState: ListState<Item, Additional, Error>,
      ) => loadItemsOption(listState, props);

      const renderContent = (
        filterlistRenderProps: ComponentRenderProps<Item, Additional, Error>,
      ): ReactNode => React.createElement(
        WrappedComponent,
        {
          ...props,
          ...filterlistRenderProps,
        },
      );

      const filterlistProps = {
        ...options,
        loadItems,
        filtersAndSortData: props,
        onChangeLoadParams: options.onChangeLoadParams && onChangeLoadParams,
        children: renderContent,
      };

      return React.createElement(
        Filterlist,
        filterlistProps,
      );
    };

    return WithFilterlist;
  };
};

export default createFilterlist;
