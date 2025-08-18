import styles from './Badge.module.css';
import {cx} from '../classNames';
import {JSX} from 'react';
export function Badge(props: JSX.IntrinsicElements['span']) {
  return <span {...props} className={cx(styles.badge, props.className)} />;
}
