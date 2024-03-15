/** @jsxImportSource @builder.io/qwik */
import { type QRL, component$ } from "@builder.io/qwik";
import { clsx } from "clsx";
import buttonStyles from "./Button.module.css";
import styles from "./Filters.module.css";
import { StringFilter } from "./StringFilter";

type FiltersProps = Readonly<{
	filters: Readonly<Record<string, unknown>>;
	setFilterValue$: QRL<(filterName: string, value: unknown) => void>;
	resetFilter$: QRL<(filterName: string) => Promise<void>>;
	applyFilter$: QRL<(filterName: string) => Promise<void>>;
	resetAllFilters$: QRL<() => Promise<void>>;
	reload$: QRL<() => Promise<void>>;
}>;

export const Filters = component$(
	({
		filters,
		resetAllFilters$,
		setFilterValue$,
		resetFilter$,
		applyFilter$,
		reload$,
	}: FiltersProps) => {
		return (
			<div class={styles.wrapper}>
				<div class={styles.filtersWrapper}>
					<StringFilter
						name="name"
						value={filters.name}
						setFilterValue$={setFilterValue$}
						resetFilter$={resetFilter$}
						applyFilter$={applyFilter$}
					/>

					<StringFilter
						name="email"
						value={filters.email}
						setFilterValue$={setFilterValue$}
						resetFilter$={resetFilter$}
						applyFilter$={applyFilter$}
					/>

					<StringFilter
						name="city"
						value={filters.city}
						setFilterValue$={setFilterValue$}
						resetFilter$={resetFilter$}
						applyFilter$={applyFilter$}
					/>
				</div>

				<div class={styles.resetWrapper}>
					<button
						class={clsx(buttonStyles.button, buttonStyles.buttonDanger)}
						type="button"
						onClick$={reload$}
					>
						Reload
					</button>

					<button
						class={clsx(buttonStyles.button, buttonStyles.buttonDanger)}
						type="button"
						onClick$={resetAllFilters$}
					>
						Reset all filters
					</button>
				</div>
			</div>
		);
	},
);
