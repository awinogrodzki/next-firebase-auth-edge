import {useRouter} from 'next/navigation';
import {useRedirectParam} from './useRedirectParam';

export function useRedirectAfterLogin() {
  const router = useRouter();
  const redirect = useRedirectParam();

  return function () {
    router.push(redirect ?? '/');
    router.refresh();
  };
}
