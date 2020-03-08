import React, {
  Component,
  ComponentClass,
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

const createFilterlist = <Item, Additional = any, Error = any, >(options: HOCParams<Item, Additional, Error>) => {
  return (WrappedComponent: ComponentClass): ComponentClass => {
    class WithFilterlist extends Component {
      onChangeLoadParams = (nextListState: ListState<Item, Additional, Error>): void => {
        const {
          onChangeLoadParams,
        } = options;

        onChangeLoadParams(nextListState, this.props);
      }

      loadItems: ItemsLoader<Item, Additional, Error> = (listState: ListState<Item, Additional, Error>) => {
        const {
          loadItems,
        } = options;

        return loadItems(listState, this.props);
      }

      renderContent = (filterlistProps: ComponentRenderProps<Item, Additional, Error>): ReactNode => (
        <WrappedComponent
          {...this.props}
          {...filterlistProps}
        />
      );

      render() {
        return (
          <Filterlist<Item, Additional, Error>
            {...options}
            loadItems={this.loadItems}
            filtersAndSortData={this.props}
            onChangeLoadParams={options.onChangeLoadParams && this.onChangeLoadParams}
          >
            {this.renderContent}
          </Filterlist>
        );
      }
    }

    return WithFilterlist;
  };
}

export default createFilterlist;
