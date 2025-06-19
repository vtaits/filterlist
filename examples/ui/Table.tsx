/** @jsxImportSource react */
import { memo, type ReactElement } from "react";
import type { Sort } from "../../packages/filterlist/src/types";
import type { User } from "../types";
import { Th } from "./Th";

type TableProps = Readonly<{
	sort: Sort;
	items: readonly User[];
	setSorting: (param: string) => void;
}>;

function TableInner({ sort, items, setSorting }: TableProps): ReactElement {
	return (
		<table
			style={{
				width: "100%",
			}}
		>
			<thead>
				<tr>
					<Th
						param="id"
						current={sort.param}
						asc={sort.asc}
						setSorting={setSorting}
					>
						id
					</Th>

					<Th
						param="name"
						current={sort.param}
						asc={sort.asc}
						setSorting={setSorting}
					>
						name
					</Th>

					<Th
						param="email"
						current={sort.param}
						asc={sort.asc}
						setSorting={setSorting}
					>
						email
					</Th>

					<Th
						param="city"
						current={sort.param}
						asc={sort.asc}
						setSorting={setSorting}
					>
						city
					</Th>
				</tr>
			</thead>

			<tbody>
				{items.map(({ id, name, email, city }) => (
					<tr key={id}>
						<td>{id}</td>
						<td>{name}</td>
						<td>{email}</td>
						<td>{city}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

export const Table = memo(TableInner);
