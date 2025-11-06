## 4.0.0 (06 nov 2025)

### Breaking changes

* Removed `parseFiltersAndSort`, `filtersAndSortData`, `shouldRecount` in favor of using data stores

## 3.0.0 (11 jun 2025)

### Breaking changes

* Removed CommonJS build

## 2.1.0 (21 oct 2024)

### Improvement

* Support `@vtaits/filterlist@^2.4.0`

## 2.0.0 (15 jul 2024)

### Breaking changes

* Changed result of `useFilterlist`, moved `appliedFilters`, `page`, `pageSize`, `sort` to the first element

    ```typescript
    const [requestParams, listState, filterlist] = useFilterlist({
        // ...
    });
    ```

* Migrate to `@vtaits/filterlist@^2.0.0`

## 1.2.0 (08 may 2024)

### Improvement

* Support `@vtaits/filterlist@^1.1.0`

## 1.1.0 (08 may 2024)

### New features

* Added `useFilter` hook
* Added `useBoundFilter` hook to the result of `useFilterlist`

## 1.0.0 (28 jan 2024)

### Typings

* Strict typing
* `any` -> `unknown`

### Internal changes

* Migrate from `babel` to `vite`

### Breaking changes

* Migrate to `@vtaits/filterlist@^1.0.0`
* Remove api with HOC and render props

## 0.3.0 (01 oct 2021)

### New features

* Support `reload` method of filterlist

## 0.3.0 (01 dec 2020)

### Improvement

* Make `typescript` typings more strict

### Internal changes

- Migrate to [new JSX transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

### Breaking changes

- Drop `react` less than `16.14.0`

## 0.2.4 (23 jun 2020)

### Bugfix

- Improve typings

## 0.2.1 (31 mar 2020)

### Bugfix

- Fixed crash of `Filterlist` if component unmounted during async initialization

## 0.2.0 (23 mar 2020)

### Breaking changes

Mirgrte to `@vtaits/filterlist@^0.2.0`
