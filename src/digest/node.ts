import { createHash } from 'crypto'
import { DigestFunction } from './types'

export const digest: DigestFunction = async (
  algorithm: 'sha256' | 'sha384' | 'sha512',
  data: Uint8Array,
): Promise<Uint8Array> => createHash(algorithm).update(data).digest();