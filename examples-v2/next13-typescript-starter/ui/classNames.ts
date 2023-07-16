export function cx(...className: (string | undefined)[]): string {
  return className.filter(Boolean).join(" ");
}
