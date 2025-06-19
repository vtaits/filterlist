/** @jsxImportSource @builder.io/qwik */
import { component$, type QRL } from "@builder.io/qwik";
import styles from "./ItemsPerPage.module.css";

type ItemsPerPageProps = Readonly<{
	value: number;
	setPageSize$: QRL<(pageSize: number | null | undefined) => Promise<void>>;
}>;

export const ItemsPerPage = component$(
	({ value, setPageSize$ }: ItemsPerPageProps) => {
		return (
			<div class={styles.wrapper}>
				<div class={styles.text}>Items per page</div>

				<select
					class={styles.select}
					value={value}
					onChange$={(event) => {
						setPageSize$(Number((event.target as HTMLInputElement).value));
					}}
				>
					<option value="10">10</option>
					<option value="20">20</option>
					<option value="30">30</option>
				</select>
			</div>
		);
	},
);
