import {TokenSet} from '../auth/types.js';
import {SetAuthCookiesOptions} from './cookies/types.js';

export async function getMetadataInternal<Metadata extends object>(
  tokens: TokenSet,
  options: SetAuthCookiesOptions<Metadata>
): Promise<Metadata> {
  if (!options.getMetadata) {
    return {} as Metadata;
  }

  return await options.getMetadata(tokens);
}
