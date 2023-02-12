import * as React from "react";
import styles from "./button.module.css";

export function Button(props: JSX.IntrinsicElements["button"]) {
  return <button className={styles.button} {...props} />;
}
