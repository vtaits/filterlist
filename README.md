# ⚠️ Deprecation warning ⚠️

This project solves problems that were relevant 10 years ago. But development goes on and there are much better solutions to these problems.

The project can be decomposed into independent components:

1. Data fetcher with features such as auto refresh, request status etc. Alternatives: [tanstack query](https://tanstack.com/query/latest), [swr](https://swr.vercel.app/)

2. Filters and sorting state resolver. Any form library can be used as alternative ([react-hook-form](https://react-hook-form.com/), [tanstack form](https://tanstack.com/form/latest))

------

[![devDependencies status](https://david-dm.org/vtaits/filterlist/dev-status.svg)](https://david-dm.org/vtaits/filterlist?type=dev)

# filterlist

Util for creating lists with filters, sotring, paginatinon, endless scroll etc.

## Sandbox examples

- Table with filters: [demo](https://kto5e.csb.app/), [source](https://codesandbox.io/s/example-kto5e)

## Packages

- [Core package](https://github.com/vtaits/filterlist/tree/master/packages/filterlist)

- [Integration with react](https://github.com/vtaits/filterlist/tree/master/packages/react-filterlist)

- [Integration with qwik](https://github.com/vtaits/filterlist/tree/master/packages/qwik-filterlist)

## Local development

Repository is using [Bun](https://bun.sh/).

### Commands

- `bun run lint:fix` - correct code of all packages;

- `bun run build` - build all packages;

- `bun run test` - run code validators and unit tests;

- `bun run start` - start [storybook](https://storybook.js.org/) with examples.
