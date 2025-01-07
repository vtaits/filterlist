import { definition as faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
/** @jsxImportSource react */
import type { ReactElement } from "react";
import styles from "./Preloader.module.css";

export function Preloader(): ReactElement {
	return (
		<div className={styles.preloader}>
			<FontAwesomeIcon icon={faSpinner} pulse size="2x" />
		</div>
	);
}
