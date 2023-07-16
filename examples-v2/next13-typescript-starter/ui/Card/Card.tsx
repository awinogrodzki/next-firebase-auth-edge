import styles from "./Card.module.css";
import { cx } from "../classNames";
export function Card(props: JSX.IntrinsicElements["div"]) {
  return <div {...props} className={cx(styles.card, props.className)} />;
}
