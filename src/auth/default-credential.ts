import {ComputeEngineCredential, Credential} from './credential';

export const getApplicationDefault = (): Credential => {
  return new ComputeEngineCredential();
};
