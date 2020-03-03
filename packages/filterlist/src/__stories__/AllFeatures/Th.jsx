import React, { Component } from 'react';
import PropTypes from 'prop-types';

const style = {
  cursor: 'pointer',
  color: 'blue',
};

class Th extends Component {
  setSorting = () => {
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

Th.propTypes = {
  param: PropTypes.string.isRequired,
  current: PropTypes.string,
  asc: PropTypes.bool,

  setSorting: PropTypes.func.isRequired,

  children: PropTypes.node,
};

Th.defaultProps = {
  asc: null,
  current: null,
  children: null,
};

export default Th;
