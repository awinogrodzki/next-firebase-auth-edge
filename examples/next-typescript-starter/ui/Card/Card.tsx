import styles from './Card.module.css';
import {cx} from '../classNames';
import {JSX} from 'react';
export function Card(props: JSX.IntrinsicElements['div']) {
  return <div {...props} className={cx(styles.card, props.className)} />;
}
