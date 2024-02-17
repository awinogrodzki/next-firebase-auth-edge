import {
  ComputeEngineCredential,
  Credential,
  ImpersonatedServiceAccount,
  ImpersonatedServiceAccountCredential,
  RefreshToken,
  RefreshTokenCredential,
  ServiceAccount,
  ServiceAccountCredential
} from './credential';

declare global {
  const EdgeRuntime: string;
}

export let getApplicationDefault: () => Credential;

if (typeof EdgeRuntime !== 'string') {
  const os = require('os');
  const path = require('path');
  const fs = require('fs');

  const configDir = (() => {
    const sys = os.platform();
    if (sys && sys.length >= 3 && sys.substring(0, 3).toLowerCase() === 'win') {
      return process.env.APPDATA;
    }

    return process.env.HOME && path.resolve(process.env.HOME, '.config');
  })();

  const GCLOUD_CREDENTIAL_SUFFIX =
    'gcloud/application_default_credentials.json';
  const GCLOUD_CREDENTIAL_PATH =
    configDir && path.resolve(configDir, GCLOUD_CREDENTIAL_SUFFIX);

  function credentialFromFile(
    filePath: string,
    ignoreMissing?: boolean
  ): Credential | null {
    const credentialsFile = readCredentialFile(filePath, ignoreMissing);

    if (typeof credentialsFile !== 'object' || credentialsFile === null) {
      if (ignoreMissing) {
        return null;
      }
      throw new Error(
        'Failed to parse contents of the credentials file as an object'
      );
    }

    if (credentialsFile.type === 'service_account') {
      return new ServiceAccountCredential(credentialsFile as ServiceAccount);
    }

    if (credentialsFile.type === 'authorized_user') {
      return new RefreshTokenCredential(credentialsFile as RefreshToken);
    }

    if (credentialsFile.type === 'impersonated_service_account') {
      return new ImpersonatedServiceAccountCredential(
        credentialsFile as ImpersonatedServiceAccount
      );
    }

    throw new Error('Invalid contents in the credentials file');
  }

  function readCredentialFile(
    filePath: string,
    ignoreMissing?: boolean
  ): {[key: string]: any} | null {
    let fileText: string;
    try {
      fileText = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      if (ignoreMissing) {
        return null;
      }

      throw new Error(
        `Failed to read credentials from file ${filePath}: ` + error
      );
    }

    try {
      return JSON.parse(fileText);
    } catch (error) {
      throw new Error(
        'Failed to parse contents of the credentials file as an object: ' +
          error
      );
    }
  }

  getApplicationDefault = (): Credential => {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return credentialFromFile(
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        false
      )!;
    }

    if (GCLOUD_CREDENTIAL_PATH) {
      const credential = credentialFromFile(GCLOUD_CREDENTIAL_PATH, true);
      if (credential) return credential;
    }

    return new ComputeEngineCredential();
  };
} else {
  getApplicationDefault = (): Credential => {
    throw new Error(
      'Edge environment does not support default environment credentials. You need to provide `ServiceAccountCredential` as `credential` option.'
    );
  };
}
