import Link from 'next/link';
import HeroCode from './HeroCode';
import LinkButton from './LinkButton';
import Wrapper from './Wrapper';

type Props = {
  description: string;
  getStarted: string;
  titleRegular: string;
  titleStrong: string;
  viewExample: string;
};

export default function Hero({
  description,
  getStarted,
  titleRegular,
  titleStrong,
  viewExample
}: Props) {
  return (
    <div className="dark overflow-hidden">
      <div className="relative max-w-full overflow-hidden bg-slate-850 py-16 sm:px-2 lg:px-0">
        <div className="absolute left-0 top-0 h-[20500px] w-[20500px] translate-x-[-47.5%] rounded-full bg-gradient-to-b from-slate-900 via-cyan-500 md:top-1" />
        <Wrapper>
          <div className="flex flex-col gap-16 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <h1 className="inline bg-gradient-to-r from-white via-sky-100 to-primary bg-clip-text text-3xl leading-tight tracking-tight text-transparent lg:text-5xl">
                <strong className="font-semibold">{titleStrong}</strong>{' '}
                <span className="font-light">{titleRegular}</span>
              </h1>

              <p className="mt-3 max-w-xl text-lg leading-normal tracking-tight text-sky-100/70 lg:mt-4 lg:text-2xl lg:leading-normal">
                {description}
              </p>
              <div className="mt-8 flex gap-4 lg:mt-10">
                <LinkButton href="/docs">{getStarted}</LinkButton>
                <LinkButton
                  href="https://next-intl-example-app-router.vercel.app"
                  target="_blank"
                  variant="secondary"
                >
                  {viewExample}
                </LinkButton>
              </div>
            </div>
            <div className="max-w-[44rem] xl:-mr-8 2xl:-mr-16">
              <HeroCode />
            </div>
          </div>
        </Wrapper>
      </div>
    </div>
  );
}
