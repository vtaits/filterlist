/** @jsxImportSource react */
import { type ReactElement, type ReactNode, memo, useCallback } from "react";

import styled from "styled-components";

const StyledTh = styled.th({
	cursor: "pointer",
	color: "blue",
	borderBottom: "2px solid #ccc",
	padding: "5px 10px",
	textAlign: "left",
	outline: "none",

	"&:hover": {
		textDecoration: "underline",
	},

	"&:active": {
		opacity: 0.75,
	},

	"& + &": {
		borderLeft: "1px solid #ccc",
	},
});

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
		<StyledTh onClick={onClick} role="button" tabIndex={0}>
			{children}

			{param === current && (asc ? "↓" : "↑")}
		</StyledTh>
	);
}

export const Th = memo(ThInner);
