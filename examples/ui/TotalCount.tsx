/** @jsxImportSource react */
import type { ReactElement } from "react";

type TotalCountProps = {
	readonly count: number;
};

export function TotalCount({ count }: TotalCountProps): ReactElement {
	return <h5>Total: {count}</h5>;
}
