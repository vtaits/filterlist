/** @jsxImportSource react */
import styled from "styled-components";

type ButtonType = "default" | "danger";

type ButtonProps = {
	readonly $buttonType?: ButtonType;
};

const mapTypeToColor: Readonly<Record<ButtonType, string>> = {
	default: "#666",
	danger: "#f44336",
};

export const Button = styled.button<ButtonProps>(
	({ $buttonType = "default", disabled }) => {
		const baseColor = mapTypeToColor[$buttonType];

		return {
			cursor: disabled ? "default" : "pointer",
			height: 30,
			borderRadius: 15,
			backgroundColor: "transparent",
			fontSize: 16,
			borderStyle: "solid",
			borderWidth: 2,
			outline: "none",
			color: baseColor,
			borderColor: baseColor,
			transition: "all 0.15s",
			paddingLeft: 20,
			paddingRight: 20,
			opacity: disabled ? 0.5 : 1,

			"&:hover": disabled
				? undefined
				: {
						backgroundColor: baseColor,
						color: "#fff",
					},

			"&:active": disabled
				? undefined
				: {
						opacity: 0.75,
					},
		};
	},
);
