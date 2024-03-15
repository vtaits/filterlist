/** @jsxImportSource react */
import {
	type ReactElement,
	type SyntheticEvent,
	memo,
	useCallback,
} from "react";

import styled from "styled-components";

const StyledWrapper = styled.div({
	display: "inline-flex",
	alignItems: "center",
});

const StyledText = styled.div({
	paddingRight: 20,
});

const StyledSelect = styled.select({
	height: 30,
	borderRadius: 15,
	boxSizing: "border-box",
	border: "2px solid #999",
	backgroundColor: "#fff",
	outline: "none",
	paddingLeft: 15,
	paddingRight: 15,
});

type ItemsPerPageProps = Readonly<{
	value: number;
	setPageSize: (pageSize: number | null | undefined) => Promise<void>;
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
		<StyledWrapper>
			<StyledText>Items per page</StyledText>

			<StyledSelect value={value} onChange={onChange}>
				<option value="10">10</option>
				<option value="20">20</option>
				<option value="30">30</option>
			</StyledSelect>
		</StyledWrapper>
	);
}

export const ItemsPerPage = memo(ItemsPerPageInner);
