import * as React from "react";
import styles from "./PasswordForm.module.css";
import { cx } from "../classNames";
import { Input } from "../Input";
import { IconButton } from "../IconButton";
import { VisibleIcon } from "../icons/VisibleIcon";
import { HiddenIcon } from "../icons/HiddenIcon";
import { Button } from "../Button";
import { FirebaseError } from "@firebase/util";
import { FormError } from "../FormError";

export interface PasswordFormValue {
  email: string;
  password: string;
}

interface PasswordFormProps
  extends Omit<JSX.IntrinsicElements["form"], "onSubmit"> {
  loading: boolean;
  onSubmit: (value: PasswordFormValue) => void;
  error?: FirebaseError;
}
export function PasswordForm({
  children,
  loading,
  error,
  onSubmit,
  ...props
}: PasswordFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isHidden, setIsHidden] = React.useState(true);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    event.stopPropagation();

    onSubmit({
      email,
      password,
    });
  }

  return (
    <div className={cx(styles.container, props.className)}>
      <form onSubmit={handleSubmit} {...props} className={styles.form}>
        <Input
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          type="email"
          placeholder="Email address"
        />
        <div className={styles.input}>
          <Input
            required
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={isHidden ? "password" : "text"}
            placeholder="Password"
            minLength={8}
          />
          {(isHidden && (
            <IconButton
              onClick={() => setIsHidden(false)}
              className={styles.adornment}
            >
              <VisibleIcon />
            </IconButton>
          )) || (
            <IconButton
              onClick={() => setIsHidden(true)}
              className={styles.adornment}
            >
              <HiddenIcon />
            </IconButton>
          )}
        </div>
        {error && <FormError>{error.message}</FormError>}
        <Button
          loading={loading}
          disabled={loading}
          variant="contained"
          type="submit"
        >
          Submit
        </Button>
      </form>
      {children}
    </div>
  );
}
