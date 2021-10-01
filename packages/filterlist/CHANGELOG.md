## 0.2.3

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

  filterlist.emitter.addListener(eventTypes.changeListState, () => {
    ...
  });
  ```
