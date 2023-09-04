import { useCallback } from "react";
import type { ReactElement } from "react";

import styled from "styled-components";

import { Paginator } from "@vtaits/react-paginator";

import { Button } from "./Button";
import { Filters } from "./Filters";
import { Table } from "./Table";
import { ItemsPerPage } from "./ItemsPerPage";
import { Preloader } from "./Preloader";
import { TotalCount } from "./TotalCount";

import type { User, Additional } from "../types";

import type { Sort, ListState } from "../../packages/filterlist/src/types";

type PageProps = {
	readonly listState: ListState<User, Additional, unknown>;
	readonly filters: Readonly<Record<string, unknown>>;
	readonly appliedFilters: Readonly<Record<string, unknown>>;
	readonly sort: Sort;
	readonly items: readonly User[];
	readonly additional?: Additional;
	readonly loading: boolean;
	readonly setFilterValue: (filterName: string, value: unknown) => void;
	readonly resetFilter: (filterName: string) => Promise<void>;
	readonly applyFilter: (filterName: string) => Promise<void>;
	readonly setAndApplyFilter: (filterName: string, value: unknown) => Promise<void>;
	readonly resetAllFilters: () => Promise<void>;
	readonly reload: () => Promise<void>;
	readonly setSorting: (param: string) => void;
	readonly isInfinity?: boolean;
	readonly loadMore?: () => void;
};

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
	appliedFilters,
	sort,
	items,
	additional,
	loading,
	resetAllFilters,
	reload,
	setFilterValue,
	resetFilter,
	applyFilter,
	setAndApplyFilter,
	setSorting,
	isInfinity,
	loadMore,
}: PageProps): ReactElement {
	const onPageChange = useCallback(
		(page: number): void => {
			setAndApplyFilter("page", page);
		},
		[setAndApplyFilter],
	);

	const { loadedPages } = listState;

	const perPage = typeof filters.perPage === "number" ? filters.perPage : 10;
	const page = typeof appliedFilters.page === "number" ? appliedFilters.page : 1;

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
					{additional && <TotalCount count={additional.count} />}
				</StyledTotalCountBlock>

				<Table items={items} sort={sort} setSorting={setSorting} />

				{loading && <Preloader />}

				<StyledBottomBlock>
					{isInfinity ? (
						<Button
							type="button"
							onClick={loadMore}
							disabled={
								!additional ||
								Math.ceil(additional.count / perPage) === loadedPages
							}
						>
							Load more
						</Button>
					) : (
						<>
							<div>
								{additional && additional.count > 0 && (
									<Paginator
										page={page}
										pageCount={Math.ceil(additional.count / perPage)}
										onPageChange={onPageChange}
									/>
								)}
							</div>

							<ItemsPerPage
								name="perPage"
								value={perPage}
								setAndApplyFilter={setAndApplyFilter}
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

Page.defaultProps = {
	additional: undefined,
	isInfinity: false,
	loadMore: undefined,
};
