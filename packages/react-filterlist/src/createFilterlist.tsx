import {
  useCallback,
} from 'react';
import type {
  ComponentType,
  FC,
  ReactElement,
  ReactNode,
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

type HOCProps<PermanentProps, Item, Additional, Error> =
  & Omit<PermanentProps, 'isListInited' | 'listState' | 'listActions'>
  & ComponentRenderProps<Item, Additional, Error>;

type HOC<PermanentProps, Item, Additional, Error> = (
  WrappedComponent: ComponentType<HOCProps<PermanentProps, Item, Additional, Error>>
) => FC<PermanentProps>;

function createFilterlist<PermanentProps, Item, Additional, Error>(
  options: HOCParams<Item, Additional, Error>,
): HOC<PermanentProps, Item, Additional, Error> {
  const {
    loadItems: loadItemsOption,
    onChangeLoadParams: onChangeLoadParamsOption,
  } = options;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  return (
    WrappedComponent: ComponentType<HOCProps<PermanentProps, Item, Additional, Error>>,
  ): FC<PermanentProps> => {
    function WithFilterlist(props: PermanentProps): ReactElement {
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
      ): ReactNode => (
        <WrappedComponent
          {...props}
          {...filterlistRenderProps}
        />
      );

      return (
        <Filterlist
          {...options}
          loadItems={loadItems}
          filtersAndSortData={props}
          onChangeLoadParams={options.onChangeLoadParams && onChangeLoadParams}
        >
          {renderContent}
        </Filterlist>
      );
    }

    return WithFilterlist;
  };
}

export default createFilterlist;
