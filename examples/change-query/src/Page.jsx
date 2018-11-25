import React, { Component } from 'react';
import PropTypes from 'prop-types';

const buttonStyle = {
  marginRight: '10px',
};

class Page extends Component {
  static propTypes = {
    page: PropTypes.number.isRequired,
    isCurrent: PropTypes.bool.isRequired,

    setPage: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.setPage = this.setPage.bind(this);
  }

  setPage() {
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

export default Page;
