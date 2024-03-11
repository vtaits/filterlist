import { type ReactElement, useCallback } from "react";

import styled from "styled-components";

import { Paginator } from "@vtaits/react-paginator";

import { Button } from "./Button";
import { Filters } from "./Filters";
import { ItemsPerPage } from "./ItemsPerPage";
import { Preloader } from "./Preloader";
import { Table } from "./Table";
import { TotalCount } from "./TotalCount";

import type { Additional, User } from "../types";

import type { ListState, Sort } from "../../packages/filterlist/src/types";

type PageProps = Readonly<{
	listState: ListState<User, Additional, unknown>;
	filters: Readonly<Record<string, unknown>>;
	page: number;
	pageSize?: number | null;
	sort: Sort;
	items: readonly User[];
	total?: number | null;
	loading: boolean;
	setFilterValue: (filterName: string, value: unknown) => void;
	resetFilter: (filterName: string) => Promise<void>;
	applyFilter: (filterName: string) => Promise<void>;
	setPage: (page: number) => Promise<void>;
	setPageSize: (pageSize: number | null | undefined) => Promise<void>;
	resetAllFilters: () => Promise<void>;
	reload: () => Promise<void>;
	setSorting: (param: string) => void;
	isInfinity?: boolean;
	loadMore?: () => void;
}>;

const StyledWrapper = styled.div({
	display: "flex",
	alignItems: "flex-start",
});

const StyledView = styled.div({
	maxWidth: 900,
});

const StyledListStateWrapper = styled.div({
	paddingLeft: 40,
});

const StyledListStateTitle = styled.div({
	fontSize: 24,
	lineHeight: 1.2,
	marginBottom: 20,
});

const StyledListState = styled.pre({
	boxSizing: "border-box",
	backgroundColor: "#efefef",
	width: 600,
	height: 600,
	padding: 15,
	overflow: "auto",
});

const StyledTotalCountBlock = styled.div({
	marginBottom: 20,
	height: 22,
});

const StyledBottomBlock = styled.div({
	display: "flex",
	justifyContent: "space-between",
	marginTop: 30,
});

export function Page({
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
	setPage,
	setPageSize,
	setSorting,
	isInfinity = false,
	loadMore = undefined,
}: PageProps): ReactElement {
	const { loadedPages } = listState;

	const pageSize = pageSizeProp || 10;

	return (
		<StyledWrapper>
			<StyledView>
				<Filters
					filters={filters}
					resetAllFilters={resetAllFilters}
					setFilterValue={setFilterValue}
					resetFilter={resetFilter}
					applyFilter={applyFilter}
					reload={reload}
				/>

				<StyledTotalCountBlock>
					{total && <TotalCount count={total} />}
				</StyledTotalCountBlock>

				<Table items={items} sort={sort} setSorting={setSorting} />

				{loading && <Preloader />}

				<StyledBottomBlock>
					{isInfinity ? (
						<Button
							type="button"
							onClick={loadMore}
							disabled={!total || Math.ceil(total / pageSize) === loadedPages}
						>
							Load more
						</Button>
					) : (
						<>
							<div>
								{total && total > 0 && (
									<Paginator
										page={page}
										pageCount={Math.ceil(total / pageSize)}
										onPageChange={setPage}
									/>
								)}
							</div>

							<ItemsPerPage
								value={pageSize}
								setPageSize={setPageSize}
							/>
						</>
					)}
				</StyledBottomBlock>
			</StyledView>

			<StyledListStateWrapper>
				<StyledListStateTitle>
					Current state of filterlist:
				</StyledListStateTitle>

				<StyledListState>{JSON.stringify(listState, null, 2)}</StyledListState>
			</StyledListStateWrapper>
		</StyledWrapper>
	);
}
