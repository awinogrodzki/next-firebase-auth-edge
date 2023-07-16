import * as React from "react";
import styles from "./icons.module.css";

export function HomeIcon(props: JSX.IntrinsicElements["span"]) {
  return (
    <span
      {...props}
      className={[styles.icon, props.className].filter(Boolean).join(" ")}
    >
      <svg
        focusable="false"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
      </svg>
    </span>
  );
}
