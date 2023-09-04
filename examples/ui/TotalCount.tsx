import type { ReactElement } from "react";

import styled from "styled-components";

const StyledWrapper = styled.div({
	fontSize: 18,
	lineHeight: 1.2,
});

type TotalCountProps = {
	readonly count: number;
};

export function TotalCount({ count }: TotalCountProps): ReactElement {
	return <StyledWrapper>Total: {count}</StyledWrapper>;
}
