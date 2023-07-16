import * as React from "react";
import styles from "./Button.module.css";
import { LoadingIcon } from "../icons";
import { cx } from "../classNames";

const variantClassNames = {
  contained: styles.contained,
  outlined: styles.outlined,
};

export function Button({
  loading,
  children,
  variant = "outlined",
  ...props
}: JSX.IntrinsicElements["button"] & {
  loading?: boolean;
  variant?: "contained" | "outlined";
}) {
  return (
    <button
      {...props}
      className={cx(styles.button, variantClassNames[variant], props.className)}
    >
      {loading && <LoadingIcon className={styles.icon} />}
      <span>{children}</span>
    </button>
  );
}
