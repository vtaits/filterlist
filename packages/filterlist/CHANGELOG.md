## 0.3.0

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
