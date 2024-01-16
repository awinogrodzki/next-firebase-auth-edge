import {ReactNode} from 'react';
import Wrapper from './Wrapper';

type Props = {
  children: ReactNode;
  description: string;
  title: string;
};

export default function Section({children, description, title}: Props) {
  return (
    <section className="py-20 lg:py-40">
      <Wrapper>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-4xl dark:text-white">
            {title}
          </h2>
          <div className="mt-6 max-w-[42rem] text-base text-slate-600 lg:text-lg dark:text-slate-400">
            {description}
          </div>
        </div>
        <div className="mt-10 lg:mt-24">{children}</div>
      </Wrapper>
    </section>
  );
}
