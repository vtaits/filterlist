/** @jsxImportSource @builder.io/qwik */
import { component$ } from "@builder.io/qwik";
import { qwikify$ } from "@builder.io/qwik-react";
import { definition as faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { FontAwesomeIcon as ReactFontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Preloader.module.css";

const FontAwesomeIcon = qwikify$(ReactFontAwesomeIcon);

export const Preloader = component$(() => {
	return (
		<div class={styles.preloader}>
			<FontAwesomeIcon icon={faSpinner} pulse size="2x" />
		</div>
	);
});
