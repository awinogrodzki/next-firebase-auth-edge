import styles from "./Badge.module.css";
import { cx } from "../classNames";
export function Badge(props: JSX.IntrinsicElements["span"]) {
  return <span {...props} className={cx(styles.badge, props.className)} />;
}
