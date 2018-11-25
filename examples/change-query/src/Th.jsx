import React, { Component } from 'react';

const style = {
  cursor: 'pointer',
  color: 'blue',
};

class Th extends Component {
  constructor(props) {
    super(props);

    this.setSorting = this.setSorting.bind(this);
  }

  setSorting() {
    const {
      param,

      setSorting,
    } = this.props;

    setSorting(param);
  }

  render() {
    const {
      param,

      current,
      asc,

      children,
    } = this.props;

    return (
      <th
        onClick={this.setSorting}
        style={style}
        role="button"
        tabIndex="0"
      >
        {children}

        {
          param === current && (
            asc ? '↓' : '↑'
          )
        }
      </th>
    );
  }
}

export default Th;
