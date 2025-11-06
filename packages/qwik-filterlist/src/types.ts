import type { QRL } from "@builder.io/qwik";
import type { Params as BaseParams, ListState } from "@vtaits/filterlist";

export type OnChangeLoadParams<Item, Additional, Error> = (
	listState: ListState<Item, Additional, Error>,
) => void;

export type Params<Item, Additional, Error> = Readonly<
	Omit<BaseParams<Item, Additional, Error>, "loadItems"> & {
		/**
		 * function that loads items into the list
		 *
		 * @throws
		 */
		loadItems$: QRL<BaseParams<Item, Additional, Error>["loadItems"]>;
		canInit?: boolean;
		onChangeLoadParams$?: QRL<OnChangeLoadParams<Item, Additional, Error>>;
	}
>;
