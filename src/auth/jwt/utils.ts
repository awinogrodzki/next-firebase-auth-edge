export function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=+$/g, "");
}

export function stringToBase64(string: string): string {
  return btoa(string)
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=+$/g, "");
}

export function objectToBase64(object: object): string {
  return stringToBase64(JSON.stringify(object));
}

type ParsedObject = { readonly [key: string]: any };
export function base64StringToObject(base64: string): ParsedObject {
  return JSON.parse(atob(prepareBase64String(base64))) as ParsedObject;
}

// https://github.com/awinogrodzki/next-firebase-auth-edge/issues/63
// Node.js 18.17 introduced native (yet experimental) WebCrypto support, which does not recognize native Node.js ArrayBuffer as correct argument
// We need to work around this issue by returning Buffer instance for WebCrypto operations in Node.js environment
export function adaptBufferForNodeJS(
  buffer: ArrayBuffer
): Buffer | ArrayBuffer {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer);
  }

  return buffer;
}

export function stringToArrayBuffer(value: string): ArrayBuffer {
  return stringToByteArray(value).buffer;
}

export function base64StringToArrayBuffer(base64: string): ArrayBuffer {
  return stringToArrayBuffer(atob(prepareBase64String(base64)));
}

export function stringToByteArray(value: string): Uint8Array {
  return new Uint8Array(
    value.split("").map((character) => character.charCodeAt(0))
  );
}

export function base64StringToByteArray(base64: string): Uint8Array {
  return stringToByteArray(atob(prepareBase64String(base64)));
}

function prepareBase64String(base64: string) {
  return base64.replace(/-/g, "+").replace(/_/g, "/");
}

export function pemToArrayBuffer(pem: string): ArrayBuffer {
  return base64StringToArrayBuffer(
    pem
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\n/g, "")
  );
}
