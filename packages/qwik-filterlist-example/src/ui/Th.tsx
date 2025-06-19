/** @jsxImportSource @builder.io/qwik */
import { component$, type QRL, Slot } from "@builder.io/qwik";
import styles from "./Th.module.css";

type ThProps = Readonly<{
	asc?: boolean;
	current?: string | null;
	param: string;
	setSorting$: QRL<(param: string) => void>;
}>;

export const Th = component$(
	({
		param,

		current = null,
		asc = undefined,

		setSorting$,
	}: ThProps) => {
		return (
			<th
				class={styles.th}
				onClick$={(): void => {
					setSorting$(param);
				}}
			>
				<Slot />

				{param === current && (asc ? "↓" : "↑")}
			</th>
		);
	},
);
