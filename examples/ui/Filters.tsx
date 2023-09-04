import type { ReactElement } from "react";

import styled from "styled-components";

import { StringFilter } from "./StringFilter";
import { Button } from "./Button";

const StyledWrapper = styled.div({
	backgroundColor: "#EEE",
	borderRadius: 10,
	padding: 20,
	marginBottom: 30,
});

const StyledFiltersWrapper = styled.div({
	marginBottom: 20,
});

const StyledResetWrapper = styled.div({
	display: "flex",
	justifyContent: "flex-end",
	gap: 20,
});

type FiltersProps = {
	filters: Record<string, any>;
	setFilterValue: (filterName: string, value: any) => void;
	resetFilter: (filterName: string) => Promise<void>;
	applyFilter: (filterName: string) => Promise<void>;
	resetAllFilters: () => Promise<void>;
	reload: () => Promise<void>;
};

export function Filters({
	filters,
	resetAllFilters,
	setFilterValue,
	resetFilter,
	applyFilter,
	reload,
}: FiltersProps): ReactElement {
	return (
		<StyledWrapper>
			<StyledFiltersWrapper>
				<StringFilter
					name="name"
					value={filters.name}
					setFilterValue={setFilterValue}
					resetFilter={resetFilter}
					applyFilter={applyFilter}
				/>

				<StringFilter
					name="email"
					value={filters.email}
					setFilterValue={setFilterValue}
					resetFilter={resetFilter}
					applyFilter={applyFilter}
				/>

				<StringFilter
					name="city"
					value={filters.city}
					setFilterValue={setFilterValue}
					resetFilter={resetFilter}
					applyFilter={applyFilter}
				/>
			</StyledFiltersWrapper>

			<StyledResetWrapper>
				<Button type="button" $buttonType="danger" onClick={reload}>
					Reload
				</Button>

				<Button type="button" $buttonType="danger" onClick={resetAllFilters}>
					Reset all filters
				</Button>
			</StyledResetWrapper>
		</StyledWrapper>
	);
}
