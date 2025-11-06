import type { Params as BaseParams, ListState } from "@vtaits/filterlist";

export type OnChangeLoadParams<Item, Additional, Error> = (
	listState: ListState<Item, Additional, Error>,
) => void;

export type Params<Item, Additional, Error> = Readonly<
	BaseParams<Item, Additional, Error> & {
		canInit?: boolean;
		onChangeLoadParams?: OnChangeLoadParams<Item, Additional, Error>;
	}
>;

export type UseFilterReturn<Value> = Readonly<{
	setFilterValue: (value: Value) => void;
	setAndApplyFilter: (value: Value) => void;
	applyFilter: () => void;
	resetFilter: () => void;
	value: Value | null;
	appliedValue: Value | null;
}>;
