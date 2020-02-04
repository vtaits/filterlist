import React, { Component } from 'react';

import Filterlist from './Filterlist';

export default function createFilterlist(options) {
  return (WrappedComponent) => {
    class WithFilterlist extends Component {
      constructor(props) {
        super(props);

        this.loadItems = this.loadItems.bind(this);
        this.onChangeLoadParams = this.onChangeLoadParams.bind(this);
        this.renderContent = this.renderContent.bind(this);
      }

      onChangeLoadParams(nextListState) {
        const {
          onChangeLoadParams,
        } = options;

        onChangeLoadParams(nextListState, this.props);
      }

      loadItems(listState) {
        const {
          loadItems,
        } = options;

        return loadItems(listState, this.props);
      }

      renderContent(filterlistProps) {
        return (
          <WrappedComponent
            {...this.props}
            {...filterlistProps}
          />
        );
      }

      render() {
        return (
          <Filterlist
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
