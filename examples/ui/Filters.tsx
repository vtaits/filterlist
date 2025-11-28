/** @jsxImportSource react */
import type { ReactElement } from "react";
import { StringFilter } from "./StringFilter";

type FiltersProps = Readonly<{
	filters: Readonly<Record<string, unknown>>;
	setAndApplyFilter: (filterName: string, value: unknown) => void;
	setFilterValue: (filterName: string, value: unknown) => void;
	resetFilter: (filterName: string) => void;
	applyFilter: (filterName: string) => void;
	resetAllFilters: () => void;
	reload: () => Promise<void>;
}>;

export function Filters({
	filters,
	resetAllFilters,
	setAndApplyFilter,
	setFilterValue,
	resetFilter,
	applyFilter,
	reload,
}: FiltersProps): ReactElement {
	return (
		<fieldset>
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

			<div className="field-row">
				<input
					type="checkbox"
					name="onlyGmail"
					id="onlyGmail"
					checked={Boolean(filters.onlyGmail)}
					onChange={(event) => {
						setAndApplyFilter("onlyGmail", event.target.checked);
					}}
				/>
				<label htmlFor="onlyGmail">Only gmail</label>
			</div>

			<div className="field-row">
				<button type="button" onClick={reload}>
					Reload
				</button>

				<button type="button" onClick={resetAllFilters}>
					Reset all filters
				</button>
			</div>
		</fieldset>
	);
}
