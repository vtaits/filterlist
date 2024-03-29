/** @jsxImportSource react */
import type { ReactElement } from "react";

import styled from "styled-components";

import { definition as faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const StyledWrapper = styled.div({
	display: "flex",
	height: 200,
	fontSize: 24,
	color: "#999",
	alignItems: "center",
	justifyContent: "center",
});

export function Preloader(): ReactElement {
	return (
		<StyledWrapper>
			<FontAwesomeIcon icon={faSpinner} pulse size="2x" />
		</StyledWrapper>
	);
}
