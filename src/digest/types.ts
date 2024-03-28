export interface DigestFunction {
  (
    digest: 'sha256' | 'sha384' | 'sha512',
    data: Uint8Array
  ): Promise<Uint8Array>;
}
