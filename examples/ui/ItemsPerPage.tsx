/** @jsxImportSource react */
import {
	type ReactElement,
	type SyntheticEvent,
	memo,
	useCallback,
} from "react";

type ItemsPerPageProps = Readonly<{
	value: number;
	setPageSize: (pageSize: number | null | undefined) => void;
}>;

function ItemsPerPageInner({
	value,
	setPageSize,
}: ItemsPerPageProps): ReactElement {
	const onChange = useCallback(
		(event: SyntheticEvent) => {
			setPageSize(Number((event.target as HTMLInputElement).value));
		},
		[setPageSize],
	);

	return (
		<div className="field-row">
			<span>Items per page</span>

			<select value={value} onChange={onChange}>
				<option value="10">10</option>
				<option value="20">20</option>
				<option value="30">30</option>
			</select>
		</div>
	);
}

export const ItemsPerPage = memo(ItemsPerPageInner);
