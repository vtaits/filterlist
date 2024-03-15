/** @jsxImportSource react */
import { type ReactElement, memo } from "react";

import styled from "styled-components";

import { Th } from "./Th";

import type { User } from "../types";

import type { Sort } from "../../packages/filterlist/src/types";

const StyledTable = styled.table({
	width: "100%",
	borderCollapse: "collapse",
});

const StyledTd = styled.td({
	borderBottom: "2px solid #ccc",
	padding: "5px 10px",
	textAlign: "left",

	"& + &": {
		borderLeft: "1px solid #ccc",
	},
});

type TableProps = Readonly<{
	sort: Sort;
	items: readonly User[];
	setSorting: (param: string) => void;
}>;

function TableInner({ sort, items, setSorting }: TableProps): ReactElement {
	return (
		<StyledTable>
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
						<StyledTd>{id}</StyledTd>
						<StyledTd>{name}</StyledTd>
						<StyledTd>{email}</StyledTd>
						<StyledTd>{city}</StyledTd>
					</tr>
				))}
			</tbody>
		</StyledTable>
	);
}

export const Table = memo(TableInner);
