export const arrayInsert = <ItemType>(
  arr: ItemType[],
  pos: number,
  item: ItemType,
) => {
  const res = arr.slice();

  res.splice(pos, 0, item);

  return res;
};
