import styles from './Switch.module.css';

interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function Switch({value, onChange}: SwitchProps) {
  return (
    <label className={styles.switch}>
      <input
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        type="checkbox"
      />
      <span className={styles.slider} />
    </label>
  );
}
