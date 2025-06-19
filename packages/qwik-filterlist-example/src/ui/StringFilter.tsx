/** @jsxImportSource @builder.io/qwik */
import { component$, type QRL } from "@builder.io/qwik";
import { clsx } from "clsx";
import buttonStyles from "./Button.module.css";
import styles from "./StringFilter.module.css";

type StringFilterProps = Readonly<{
	name: string;
	value?: unknown;
	setFilterValue$: QRL<(filterName: string, value: unknown) => void>;
	resetFilter$: QRL<(filterName: string) => Promise<void>>;
	applyFilter$: QRL<(filterName: string) => Promise<void>>;
}>;

export const StringFilter = component$(
	({
		name,
		value = undefined,
		setFilterValue$,
		resetFilter$,
		applyFilter$,
	}: StringFilterProps) => {
		return (
			<div class={styles.wrapper}>
				<div class={styles.name}>{name}</div>

				<div class={styles.inputWrapper}>
					<input
						class={styles.input}
						name={name}
						value={typeof value === "string" ? value : ""}
						onChange$={(event) => {
							setFilterValue$(name, (event.target as HTMLInputElement).value);
						}}
						onKeyDown$={(event) => {
							if (event.key === "Enter") {
								applyFilter$(name);
							}
						}}
					/>
				</div>

				<div class={styles.buttonWrapper}>
					<button
						class={buttonStyles.button}
						type="button"
						onClick$={() => {
							applyFilter$(name);
						}}
					>
						Apply
					</button>
				</div>

				<div class={styles.buttonWrapper}>
					<button
						class={clsx(buttonStyles.button, buttonStyles.buttonDanger)}
						type="button"
						onClick$={() => {
							resetFilter$(name);
						}}
					>
						Reset
					</button>
				</div>
			</div>
		);
	},
);
