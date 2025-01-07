/** @jsxImportSource react */
import {
	type KeyboardEventHandler,
	type ReactElement,
	type ReactNode,
	memo,
	useCallback,
} from "react";

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
	const handle = useCallback((): void => {
		setSorting(param);
	}, [param, setSorting]);

	const onKeyDown = useCallback<KeyboardEventHandler>(
		(event) => {
			switch (event.key) {
				case "Enter":
				case " ":
					event.preventDefault();
					handle();
					return;

				default:
					return;
			}
		},
		[handle],
	);

	return (
		<th onClick={handle} onKeyDown={onKeyDown}>
			{children}

			{param === current && (asc ? "↓" : "↑")}
		</th>
	);
}

export const Th = memo(ThInner);
