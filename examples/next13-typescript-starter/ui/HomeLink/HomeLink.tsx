import styles from "./HomeLink.module.css";
import { HomeIcon } from "../icons/HomeIcon";
import Link from "next/link";

export function HomeLink() {
  return (
    <Link className={styles.home} href="/">
      <HomeIcon />
    </Link>
  );
}
