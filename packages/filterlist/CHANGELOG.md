## Signals

* Make `listState` a signal
* Make `requestParams` a signal
* Removed `eventTypes`
* Removed `mitt` in favor of signals
* Chagned format of data stores

## 3.0.0 (11 jun 2025)

### Breaking changes

* Removed CommonJS build
* Removed proxy-directories fallback for `@vtaits/filterlist/datastore/string`

## 2.4.0 (21 oct 2024)

### New features

* Added `action` argument to `loadItems`
* Added parameter `loadedPages` to success response

## 2.3.0 (17 sep 2024)

### New features

* Added `shouldRefresh` parameter

## 2.2.0 (30 aug 2024)

### New features

* Added `parseOptions` and `stringifyOptions` to string data store
* Added `setAndApplyEmptyFilters` method

## 2.1.0 (17 jul 2024)

### New features

* Added `setRefreshTimeout` method

## 2.0.0 (15 jul 2024)

### New features

* Added `createDataStore` parameter to sync with external stores such as browser history

### Breaking changes

* Changed arguments of `loadItems`
* `eventTypes` -> `EventType`

## 1.1.0 (08 may 2024)

### New features

* Added param `debounceTimeout`
* Added param `refreshTimeout`
* Added `destroy` method

## 1.0.0 (28 jan 2024)

### New features

* Added `page` to the state of list
* Added `setPage` method
* Added `total` to the state of list
* Added `setTotal` method
* Added `pageSize` to the state of list
* Added `setPageSize` method

### Breaking changes

* `setFiltersAndSorting` -> `updateStateAndRequest`

## 0.3.1 (04 sep 2023)

### New features

* Added `shouldRequest` param

### Typings

* Support readonly arrays

## 0.3.0 (28 oct 2022)

### Typings

* Strict typing
* `any` -> `unknown`

### Internal changes

* Migrate from `babel` to `vite`

### Breaking changes

* Named export

  ```typescript
  import { Filterlist } from '@vtaits/filterlist';
  ```

* Replace `eventemitter3` with `mitt`

## 0.2.4 (01 oct 2021)

### Bugfix

* Set initial `loadedPages` = 1 if `items` defined in params

## 0.2.3 (01 oct 2021)

### New features

* Added param `loadedPages` to state of list
* Added `reload` method

## 0.2.2 (01 dec 2020)

### Improvement

* Make `typescript` typings more strict

## 0.2.0 (23 mar 2020)

### Breaking changes

* Renamed **method** `loadItems` -> `loadMore`. Param of constructor was not changed. E.g.

  ```javascript
  const filterlist = new Filterlist({
    ...params,

    loadItems: (nextListState) => {
      ...
    },
  });

  ...

  filterlist.loadMore();
  ```

* Renamed event `loadItems` -> `loadMore`

* Renamed param of constructor `initialFilters` -> `resetFiltersTo`

* Added property `emitter` instead of extending `EventEmitter` class. E.g.

  ```javascript
  const filterlist = new Filterlist({
    ...params,
  });

  ...

  filterlist.emitter.on(eventTypes.changeListState, () => {
    ...
  });
  ```
