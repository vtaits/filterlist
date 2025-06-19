/** @jsxImportSource @builder.io/qwik */
import { component$, type QRL } from "@builder.io/qwik";
import { qwikify$ } from "@builder.io/qwik-react";
import type { ListState, RequestParams } from "@vtaits/filterlist";
import { Paginator as ReactPaginator } from "@vtaits/react-paginator";
import type { Additional, User } from "../../../../examples/types";
import buttonStyles from "./Button.module.css";
import { Filters } from "./Filters";
import { ItemsPerPage } from "./ItemsPerPage";
import styles from "./Page.module.css";
import { Preloader } from "./Preloader";
import { Table } from "./Table";
import { TotalCount } from "./TotalCount";

const Paginator = qwikify$(ReactPaginator);

type PageProps = Readonly<{
	listState: ListState<User, Additional, unknown>;
	requestParams: RequestParams;
	setFilterValue$: QRL<(filterName: string, value: unknown) => void>;
	resetFilter$: QRL<(filterName: string) => void>;
	applyFilter$: QRL<(filterName: string) => void>;
	setPage$: QRL<(page: number) => void>;
	setPageSize$: QRL<(pageSize: number | null | undefined) => void>;
	resetAllFilters$: QRL<() => void>;
	reload$: QRL<() => Promise<void>>;
	setSorting$: QRL<(param: string, asc?: boolean) => void>;
	isInfinity?: boolean;
	loadMore$?: QRL<() => void>;
}>;

export const Page = component$(
	({
		listState,
		requestParams,
		resetAllFilters$,
		reload$,
		setFilterValue$,
		resetFilter$,
		applyFilter$,
		setPage$,
		setPageSize$,
		setSorting$,
		isInfinity = false,
		loadMore$ = undefined,
	}: PageProps) => {
		const { page, pageSize: pageSizeProp = null, sort } = requestParams;

		const {
			loadedPages,
			filters,
			items,
			total = undefined,
			loading,
		} = listState;

		const pageSize = pageSizeProp || 10;

		return (
			<div class={styles.wrapper}>
				<div class={styles.view}>
					<Filters
						filters={filters}
						resetAllFilters$={resetAllFilters$}
						setFilterValue$={setFilterValue$}
						resetFilter$={resetFilter$}
						applyFilter$={applyFilter$}
						reload$={reload$}
					/>

					<div class={styles.totalCount}>
						{total && <TotalCount count={total} />}
					</div>

					<Table items={items} sort={sort} setSorting$={setSorting$} />

					{loading && <Preloader />}

					<div class={styles.bottomBlock}>
						{isInfinity ? (
							<button
								class={buttonStyles.button}
								type="button"
								onClick$={loadMore$}
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
											onPageChange$={setPage$}
										/>
									)}
								</div>

								<ItemsPerPage value={pageSize} setPageSize$={setPageSize$} />
							</>
						)}
					</div>
				</div>

				<div class={styles.listStateWrapper}>
					<div class={styles.listStateTitle}>Current state of filterlist:</div>

					<pre class={styles.listState}>
						{JSON.stringify(listState, null, 2)}
					</pre>

					<div class={styles.listStateTitle}>Current request params:</div>

					<pre class={styles.listState}>
						{JSON.stringify(requestParams, null, 2)}
					</pre>
				</div>
			</div>
		);
	},
);
