import config from 'config';
import {useRouter} from 'next/router';
import FooterLink from './FooterLink';
import FooterSeparator from './FooterSeparator';

export default function Footer() {
  const router = useRouter();

  // Unfortunately, Nextra renders the footer incorrectly here
  const isHidden = router.pathname.startsWith('/examples');
  if (isHidden) return null;

  return (
    <div className="border-t border-slate-200 bg-slate-100 dark:border-t-slate-800 dark:bg-transparent">
      <div className="mx-auto max-w-[90rem] px-4 py-2 md:flex md:justify-between ">
        <div>
          <FooterLink href="/docs">Docs</FooterLink>
          <FooterSeparator />
          <FooterLink href="/examples">Examples</FooterLink>
        </div>
        <div>
          <FooterLink href={config.githubUrl} target="_blank">
            GitHub
          </FooterLink>
          <FooterSeparator />
          <FooterLink
            href="https://github.com/sponsors/awinogrodzki"
            target="_blank"
          >
            &#9829; Sponsor
          </FooterLink>
        </div>
      </div>
    </div>
  );
}
