/** @jsxImportSource @builder.io/qwik */
import { component$ } from "@builder.io/qwik";
import styles from "./TotalCount.module.css";

type TotalCountProps = Readonly<{
	count: number;
}>;

export const TotalCount = component$(({ count }: TotalCountProps) => {
	return <div class={styles.totalCount}>Total: {count}</div>;
});
