const defaultShouldRecount = <
  FiltersAndSortData = any,
>(data1: FiltersAndSortData, data2: FiltersAndSortData): boolean => data1 === data2;

export default defaultShouldRecount;
