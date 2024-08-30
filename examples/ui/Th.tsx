/** @jsxImportSource react */
import { type ReactElement, type ReactNode, memo, useCallback } from "react";

type ThProps = Readonly<{
	asc?: boolean;
	children?: ReactNode;
	current?: string | null;
	param: string;
	setSorting: (param: string) => void;
}>;

function ThInner({
	param,

	current = null,
	asc = undefined,

	children = undefined,

	setSorting,
}: ThProps): ReactElement {
	const onClick = useCallback((): void => {
		setSorting(param);
	}, [param, setSorting]);

	return (
		<th onClick={onClick} role="button" tabIndex={0}>
			{children}

			{param === current && (asc ? "↓" : "↑")}
		</th>
	);
}

export const Th = memo(ThInner);
