import styles from './IconButton.module.css';
import {cx} from '../classNames';
import {JSX} from 'react';

export function IconButton(props: JSX.IntrinsicElements['button']) {
  return (
    <button
      {...props}
      className={cx(styles.button, props.className)}
      type={props.type ?? 'button'}
    />
  );
}
