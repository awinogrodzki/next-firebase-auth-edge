import styles from "./ButtonGroup.module.css";
import { cx } from "../classNames";
export function ButtonGroup(props: JSX.IntrinsicElements["div"]) {
  return <div {...props} className={cx(styles.group, props.className)} />;
}
