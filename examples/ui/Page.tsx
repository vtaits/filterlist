import {
	type Components,
	components,
	Paginator,
} from "@vtaits/react-paginator";
/** @jsxImportSource react */
import type { ReactElement } from "react";
import type {
	ListState,
	RequestParams,
	Sort,
} from "../../packages/filterlist/src/types";
import type { Additional, User } from "../types";
import { Filters } from "./Filters";
import { ItemsPerPage } from "./ItemsPerPage";
import { Preloader } from "./Preloader";
import { Table } from "./Table";
import { TotalCount } from "./TotalCount";
import "98.css";
import styles from "./Page.module.css";

type PageProps = Readonly<{
	requestParams: RequestParams;
	listState: ListState<User, Additional, unknown>;
	filters: Readonly<Record<string, unknown>>;
	page: number;
	pageSize?: number | null;
	sort: Sort;
	items: readonly User[];
	total?: number | null;
	loading: boolean;
	setFilterValue: (filterName: string, value: unknown) => void;
	resetFilter: (filterName: string) => void;
	applyFilter: (filterName: string) => void;
	setAndApplyFilter: (filterName: string, value: unknown) => void;
	setPage: (page: number) => void;
	setPageSize: (pageSize: number | null | undefined) => void;
	resetAllFilters: () => void;
	reload: () => Promise<void>;
	setSorting: (param: string, asc?: boolean) => void;
	isInfinity?: boolean;
	loadMore?: () => void;
}>;

const paginatorComponents: Partial<Components<unknown>> = {
	Link: ({ className, ...rest }) => {
		return (
			<components.Link
				{...rest}
				style={{
					minWidth: "36px",
				}}
			/>
		);
	},
};

export function Page({
	requestParams,
	listState,
	filters,
	page,
	pageSize: pageSizeProp = null,
	sort,
	items,
	total = undefined,
	loading,
	resetAllFilters,
	reload,
	setFilterValue,
	resetFilter,
	applyFilter,
	setAndApplyFilter,
	setPage,
	setPageSize,
	setSorting,
	isInfinity = false,
	loadMore = undefined,
}: PageProps): ReactElement {
	const { loadedPages } = listState;

	const pageSize = pageSizeProp || 10;

	return (
		<div className={styles.page}>
			<div>
				<Filters
					filters={filters}
					resetAllFilters={resetAllFilters}
					setAndApplyFilter={setAndApplyFilter}
					setFilterValue={setFilterValue}
					resetFilter={resetFilter}
					applyFilter={applyFilter}
					reload={reload}
				/>

				{typeof total === "number" && <TotalCount count={total} />}

				<Table items={items} sort={sort} setSorting={setSorting} />

				{loading && <Preloader />}

				<div className={styles.bottomBlock}>
					{isInfinity ? (
						<button
							type="button"
							onClick={loadMore}
							disabled={!total || Math.ceil(total / pageSize) === loadedPages}
						>
							Load more
						</button>
					) : (
						<>
							<div>
								{typeof total === "number" && total > 0 && (
									<Paginator
										page={page}
										pageCount={Math.ceil(total / pageSize)}
										onPageChange={setPage}
										components={paginatorComponents}
									/>
								)}
							</div>

							<ItemsPerPage value={pageSize} setPageSize={setPageSize} />
						</>
					)}
				</div>
			</div>

			<div>
				<h4
					style={{
						marginTop: 0,
					}}
				>
					Current state of filterlist:
				</h4>

				<pre>
					<code>{JSON.stringify(listState, null, 2)}</code>
				</pre>

				<h4>Current request params:</h4>

				<pre>
					<code>{JSON.stringify(requestParams, null, 2)}</code>
				</pre>
			</div>
		</div>
	);
}
