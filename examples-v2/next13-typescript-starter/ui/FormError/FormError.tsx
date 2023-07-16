import styles from "./FormError.module.css";
import { cx } from "../classNames";
export function FormError(props: JSX.IntrinsicElements["span"]) {
  return <span {...props} className={cx(styles.error, props.className)} />;
}
