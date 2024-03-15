/** @jsxImportSource react */
import {
	type KeyboardEvent,
	type ReactElement,
	type SyntheticEvent,
	memo,
	useCallback,
} from "react";

import styled from "styled-components";

import { Button } from "./Button";

const StyledWrapper = styled.div({
	display: "flex",
	alignItems: "center",

	"& + &": {
		marginTop: 20,
	},
});

const StyledName = styled.div({
	width: 100,
	textAlign: "right",
	paddingRight: 20,
});

const StyledInputWrapper = styled.div({
	flex: 1,
});

const StyledButtonWrapper = styled.div({
	paddingLeft: 20,
});

const StyledInput = styled.input({
	height: 30,
	borderRadius: 15,
	boxSizing: "border-box",
	width: "100%",
	border: "2px solid #999",
	backgroundColor: "#fff",
	outline: "none",
	paddingLeft: 15,
	paddingRight: 15,
});

type StringFilterProps = Readonly<{
	name: string;
	value?: unknown;
	setFilterValue: (filterName: string, value: unknown) => void;
	resetFilter: (filterName: string) => Promise<void>;
	applyFilter: (filterName: string) => Promise<void>;
}>;

function StringFilterInner({
	name,
	value = undefined,
	setFilterValue,
	resetFilter,
	applyFilter,
}: StringFilterProps): ReactElement {
	const onChange = useCallback(
		(event: SyntheticEvent) => {
			setFilterValue(name, (event.target as HTMLInputElement).value);
		},
		[name, setFilterValue],
	);

	const onKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Enter") {
				applyFilter(name);
			}
		},
		[name, applyFilter],
	);

	const onApplyClick = useCallback(() => {
		applyFilter(name);
	}, [name, applyFilter]);

	const onResetClick = useCallback(() => {
		resetFilter(name);
	}, [name, resetFilter]);

	return (
		<StyledWrapper>
			<StyledName>{name}</StyledName>

			<StyledInputWrapper>
				<StyledInput
					name={name}
					value={typeof value === "string" ? value : ""}
					onChange={onChange}
					onKeyDown={onKeyDown}
				/>
			</StyledInputWrapper>

			<StyledButtonWrapper>
				<Button type="button" onClick={onApplyClick}>
					Apply
				</Button>
			</StyledButtonWrapper>

			<StyledButtonWrapper>
				<Button $buttonType="danger" type="button" onClick={onResetClick}>
					Reset
				</Button>
			</StyledButtonWrapper>
		</StyledWrapper>
	);
}

export const StringFilter = memo(StringFilterInner);
