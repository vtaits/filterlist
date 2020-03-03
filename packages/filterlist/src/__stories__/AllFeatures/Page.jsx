import React, { Component } from 'react';
import PropTypes from 'prop-types';

const buttonStyle = {
  marginRight: '10px',
};

class Page extends Component {
  setPage = () => {
    const {
      page,
      isCurrent,

      setPage,
    } = this.props;

    if (isCurrent) {
      return;
    }

    setPage(page);
  }

  render() {
    const {
      page,
      isCurrent,
    } = this.props;

    return (
      <button
        type="button"
        onClick={this.setPage}
        disabled={isCurrent}
        style={buttonStyle}
      >
        {page}
      </button>
    );
  }
}

Page.propTypes = {
  page: PropTypes.number.isRequired,
  isCurrent: PropTypes.bool.isRequired,

  setPage: PropTypes.func.isRequired,
};

export default Page;
