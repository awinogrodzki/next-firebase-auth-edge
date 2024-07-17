import { redirect } from 'next/navigation';
import { verifyEmailUpdate } from '../profile/UserProfile/verify-email-update';

export default async function VerifyCode({
  searchParams
}: {
  searchParams?: {[key: string]: string | string[] | undefined};
}) {
  const code = searchParams?.code;
  if (!code || typeof code !== 'string') redirect('/');
  try {
    await verifyEmailUpdate(code);
  } catch (err) {
    console.log(err);
    return <div>ERR: {err?.toString()}</div>;
  }

  return <div>SUCCESS</div>;
}
