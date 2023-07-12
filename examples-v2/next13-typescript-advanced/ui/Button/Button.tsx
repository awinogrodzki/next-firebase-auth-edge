import * as React from "react";
import styles from "./Button.module.css";
import { LoadingIcon } from "../icons";
import { cx } from "../classNames";

export function Button({
  loading,
  children,
  ...props
}: JSX.IntrinsicElements["button"] & { loading?: boolean }) {
  return (
    <button {...props} className={cx(styles.button, props.className)}>
      {loading && <LoadingIcon className={styles.icon} />}
      <span>{children}</span>
    </button>
  );
}
