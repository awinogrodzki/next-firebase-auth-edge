import styles from './page.module.css';
import {UserProfile} from './UserProfile';
import {Metadata} from 'next';
import {getTokens} from 'next-firebase-auth-edge/lib/next/tokens';
import {cookies} from 'next/headers';
import {authConfig} from '../../config/server-config';
import {Badge} from '../../ui/Badge';
import {HomeLink} from '../../ui/HomeLink';
import {MainTitle} from '../../ui/MainTitle';
import {incrementCounter} from '../actions/user-counters';
import {getUserCounter} from './UserProfile/user-counters-server';

export default async function Profile() {
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    throw new Error('Cannot get counter of unauthenticated user');
  }

  const counter = await getUserCounter(tokens.decodedToken.uid, tokens.token);

  return (
    <div className={styles.container}>
      <MainTitle>
        <HomeLink />
        <span>Profile</span>
        <Badge>Rendered on server</Badge>
      </MainTitle>
      <UserProfile
        count={counter?.count ?? 0}
        incrementCounter={incrementCounter}
      />
    </div>
  );
}

// Generate customized metadata based on user cookies
// https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export async function generateMetadata(): Promise<Metadata> {
  const tokens = await getTokens(await cookies(), authConfig);

  if (!tokens) {
    return {};
  }

  return {
    title: `${tokens.decodedToken.email} profile page | next-firebase-auth-edge example`
  };
}
