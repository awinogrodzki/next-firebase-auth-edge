import { useSearchParams } from "next/navigation";

export function useRedirectParam(): string | null {
  const params = useSearchParams();

  return params?.get("redirect") ?? null;
}
