let debugEnabled = false;

export function enableDebugMode() {
  debugEnabled = true;
}

export function debug(
  message: string,
  metadata?: Record<string, unknown | undefined>
) {
  if (!debugEnabled) {
    return;
  }

  console.log('ⓘ next-firebase-auth-edge:', message);

  if (!metadata) {
    return;
  }

  for (const key in metadata) {
    if (metadata[key]) {
      console.log('\t', `${key}:`, metadata[key]);
    }
  }
}
