import styles from './page.module.css';
import Link from 'next/link';
import {Button} from '../ui/Button';
import {MainTitle} from '../ui/MainTitle';
import {Badge} from '../ui/Badge';
import {Card} from '../ui/Card';

export async function generateStaticParams() {
  return [{}];
}

export default function Home() {
  return (
    <div className={styles.container}>
      <MainTitle>
        <span>Home</span>
        <Badge>Static</Badge>
      </MainTitle>
      <Card>
        <Link href="/profile">
          <h2>You are logged in</h2>
          <Button style={{marginBottom: 0}}>Go to profile page</Button>
        </Link>
      </Card>
    </div>
  );
}
