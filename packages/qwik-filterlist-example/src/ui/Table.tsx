/** @jsxImportSource @builder.io/qwik */
import { component$, type QRL } from "@builder.io/qwik";
import type { User } from "../../../../examples/types";
import type { Sort } from "../../../filterlist/src/types";
import styles from "./Table.module.css";
import { Th } from "./Th";

type TableProps = Readonly<{
	sort: Sort;
	items: readonly User[];
	setSorting$: QRL<(param: string) => void>;
}>;

export const Table = component$(({ sort, items, setSorting$ }: TableProps) => {
	return (
		<table class={styles.table}>
			<thead>
				<tr>
					<Th
						param="id"
						current={sort.param}
						asc={sort.asc}
						setSorting$={setSorting$}
					>
						id
					</Th>

					<Th
						param="name"
						current={sort.param}
						asc={sort.asc}
						setSorting$={setSorting$}
					>
						name
					</Th>

					<Th
						param="email"
						current={sort.param}
						asc={sort.asc}
						setSorting$={setSorting$}
					>
						email
					</Th>

					<Th
						param="city"
						current={sort.param}
						asc={sort.asc}
						setSorting$={setSorting$}
					>
						city
					</Th>
				</tr>
			</thead>

			<tbody>
				{items.map(({ id, name, email, city }) => (
					<tr key={id}>
						<td class={styles.td}>{id}</td>
						<td class={styles.td}>{name}</td>
						<td class={styles.td}>{email}</td>
						<td class={styles.td}>{city}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
});
