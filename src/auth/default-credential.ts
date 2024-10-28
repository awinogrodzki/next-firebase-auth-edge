import {ComputeEngineCredential, Credential} from './credential.js';

export const getApplicationDefault = (): Credential => {
  return new ComputeEngineCredential();
};
