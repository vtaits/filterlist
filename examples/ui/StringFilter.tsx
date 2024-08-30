/** @jsxImportSource react */
import {
	type KeyboardEvent,
	type ReactElement,
	type SyntheticEvent,
	memo,
	useCallback,
} from "react";
import styled from "styled-components";

const StyledButtonWrapper = styled.div({
	paddingLeft: 5,
});

type StringFilterProps = Readonly<{
	name: string;
	value?: unknown;
	setFilterValue: (filterName: string, value: unknown) => void;
	resetFilter: (filterName: string) => void;
	applyFilter: (filterName: string) => void;
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
		<div className="field-row">
			<div style={{
				flex: 1
			}}>
				<label htmlFor={`id_${name}`}>{name}</label>

				<div className="field-row">
					<input
						id={`id_${name}`}
						name={name}
						value={typeof value === "string" ? value : ""}
						onChange={onChange}
						onKeyDown={onKeyDown}
						style={{
							flex: 1,
						}}
					/>

					<StyledButtonWrapper>
						<button type="button" onClick={onApplyClick}>
							Apply
						</button>
					</StyledButtonWrapper>

					<StyledButtonWrapper>
						<button type="button" onClick={onResetClick}>
							Reset
						</button>
					</StyledButtonWrapper>
				</div>
			</div>
		</div>
	);
}

export const StringFilter = memo(StringFilterInner);
