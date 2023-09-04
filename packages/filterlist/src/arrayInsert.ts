export const arrayInsert = <ItemType>(
	arr: readonly ItemType[],
	pos: number,
	item: ItemType,
) => {
	const res = arr.slice();

	res.splice(pos, 0, item);

	return res;
};
