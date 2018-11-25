import React from 'react';

import Page from './Page';

const Paginator = ({
  count,
  perPage,
  current,

  setPage,
}) => {
  const pagesLength = Math.ceil(count / perPage);

  const pages = [];

  for (let i = 0; i < pagesLength; ++i) {
    const page = i + 1;
    const isCurrent = current === page;

    pages.push(
      <Page
        isCurrent={isCurrent}
        page={page}
        setPage={setPage}
        key={i}
      >
        {i + 1}
      </Page>,
    );
  }

  return (
    <div>
      {pages}
    </div>
  );
};

export default Paginator;
