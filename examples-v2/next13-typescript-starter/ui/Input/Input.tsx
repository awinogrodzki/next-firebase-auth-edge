import * as React from "react";
import styles from "./Input.module.css";
import { cx } from "../classNames";

export function Input({ children, ...props }: JSX.IntrinsicElements["input"]) {
  return (
    <input {...props} className={cx(styles.input, props.className)} />
  );
}
