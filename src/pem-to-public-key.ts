import { base64StringToByteArray } from './jwt-utils/jwt/utils';

function berToJavaScript(byteArray: Uint8Array): ASN1 {
  const result: Partial<ASN1> = {};
  let position = 0;

  result.cls              = getClass();
  result.structured       = getStructured();
  result.tag              = getTag();
  let length              = getLength(); // As encoded, which may be special value 0

  if (length === 0x80) {
    length = 0;
    while (byteArray[position + length] !== 0 || byteArray[position + length + 1] !== 0) {
      length += 1;
    }
    result.byteLength   = position + length + 2;
    result.contents     = byteArray.subarray(position, position + length);
  } else {
    result.byteLength   = position + length;
    result.contents     = byteArray.subarray(position, result.byteLength);
  }

  result.raw              = byteArray.subarray(0, result.byteLength); // May not be the whole input array
  return result as ASN1;

  function getClass() {
    return (byteArray[position] & 0xc0) / 64;
  }

  function getStructured() {
    // Consumes no bytes
    return ((byteArray[0] & 0x20) === 0x20);
  }

  function getTag() {
    let tag = byteArray[0] & 0x1f;
    position += 1;
    if (tag === 0x1f) {
      tag = 0;
      while (byteArray[position] >= 0x80) {
        tag = tag * 128 + byteArray[position] - 0x80;
        position += 1;
      }
      tag = tag * 128 + byteArray[position] - 0x80;
      position += 1;
    }
    return tag;
  }

  function getLength() {
    let length: number;

    if (byteArray[position] < 0x80) {
      length = byteArray[position];
      position += 1;
    } else {
      const numberOfDigits = byteArray[position] & 0x7f;
      position += 1;
      length = 0;
      for (let i=0; i<numberOfDigits; i++) {
        length = length * 256 + byteArray[position];
        position += 1;
      }
    }
    return length;
  }
}

function berListToJavaScript(byteArray: Uint8Array): ASN1[] {
  const result = [];
  let nextPosition = 0;
  while (nextPosition < byteArray.length) {
    const nextPiece = berToJavaScript(byteArray.subarray(nextPosition));
    result.push(nextPiece);
    nextPosition += nextPiece.byteLength;
  }
  return result;
}

interface ASN1 {
  cls: number;
  tag: number;
  structured: boolean;
  contents: Uint8Array;
  byteLength: number;
  raw: Uint8Array;
}

interface TBSCertificate {
  asn1: ASN1;
  version: ASN1;
  serialNumber: ASN1;
  signature: AlgorithmIdentifier;
  issuer: ASN1;
  validity: ASN1;
  subject: ASN1;
  subjectPublicKeyInfo: SPKI;
}

function parseTBSCertificate(asn1: ASN1): TBSCertificate {
  if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
    throw new Error("This can't be a TBSCertificate. Wrong data type.");
  }
  const pieces = berListToJavaScript(asn1.contents);

  if (pieces.length < 7) {
    throw new Error("Bad TBS Certificate. There are fewer than the seven required children.");
  }

  return {
    asn1,
    version: pieces[0],
    serialNumber: pieces[1],
    signature: parseAlgorithmIdentifier(pieces[2]),
    issuer: pieces[3],
    validity: pieces[4],
    subject: pieces[5],
    subjectPublicKeyInfo: parseSubjectPublicKeyInfo(pieces[6])
  };
}

interface AlgorithmIdentifier {
  asn1: ASN1;
  algorithm: string;
  parameters: {asn1: ASN1} | null
}

function parseAlgorithmIdentifier(asn1: ASN1): AlgorithmIdentifier {
  if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
    throw new Error("Bad algorithm identifier. Not a SEQUENCE.");
  }

  const pieces = berListToJavaScript(asn1.contents);

  if (pieces.length > 2) {
    throw new Error("Bad algorithm identifier. Contains too many child objects.");
  }

  const encodedAlgorithm = pieces[0];
  if (encodedAlgorithm.cls !== 0 || encodedAlgorithm.tag !== 6 || encodedAlgorithm.structured) {
    throw new Error("Bad algorithm identifier. Does not begin with an OBJECT IDENTIFIER.");
  }

  return {
    asn1,
    algorithm: berObjectIdentifierValue(encodedAlgorithm.contents),
    parameters: pieces.length === 2 ? {asn1: pieces[1]} : null,
  };
}

function berObjectIdentifierValue(byteArray: Uint8Array): string {
  let oid = Math.floor(byteArray[0] / 40) + "." + byteArray[0] % 40;
  let position = 1;
  while(position < byteArray.length) {
    let nextInteger = 0;
    while (byteArray[position] >= 0x80) {
      nextInteger = nextInteger * 0x80 + (byteArray[position] & 0x7f);
      position += 1;
    }
    nextInteger = nextInteger * 0x80 + byteArray[position];
    position += 1;
    oid += "." + nextInteger;
  }
  return oid;
}

interface SPKI {
  asn1: ASN1;
  algorithm: AlgorithmIdentifier;
  bits: Bits;
}

function parseSubjectPublicKeyInfo(asn1: ASN1): SPKI {
  if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
    throw new Error("Bad SPKI. Not a SEQUENCE.");
  }

  const pieces = berListToJavaScript(asn1.contents);

  if (pieces.length !== 2) {
    throw new Error("Bad SubjectPublicKeyInfo. Wrong number of child objects.");
  }

  return {
    asn1,
    algorithm: parseAlgorithmIdentifier(pieces[0]),
    bits: berBitStringValue(pieces[1].contents)
  };
}

interface Bits {
  unusedBits: number;
  bytes: Uint8Array;
}

function berBitStringValue(byteArray: Uint8Array): Bits {
  return {
    unusedBits: byteArray[0],
    bytes: byteArray.subarray(1)
  };
}

const parseSignatureAlgorithm = parseAlgorithmIdentifier;

interface Sig {
  asn1: ASN1,
  bits: Bits,
}

function parseSignatureValue(asn1: ASN1): Sig {
  if (asn1.cls !== 0 || asn1.tag !== 3 || asn1.structured) {
    throw new Error("Bad signature value. Not a BIT STRING.");
  }

  return {
    asn1,
    bits: berBitStringValue(asn1.contents),
  };
}

interface Cert {
  asn1: ASN1;
  tbsCertificate: TBSCertificate;
  signatureAlgorithm: AlgorithmIdentifier;
  signatureValue: Sig;
}

function parseCertificate(byteArray: Uint8Array): Cert {
  const asn1 = berToJavaScript(byteArray);
  if (asn1.cls !== 0 || asn1.tag !== 16 || !asn1.structured) {
    throw new Error("This can't be an X.509 certificate. Wrong data type.");
  }

  const pieces = berListToJavaScript(asn1.contents);
  if (pieces.length !== 3) {
    throw new Error("Certificate contains more than the three specified children.");
  }

  return {
    asn1,
    tbsCertificate: parseTBSCertificate(pieces[0]),
    signatureAlgorithm: parseSignatureAlgorithm(pieces[1]),
    signatureValue: parseSignatureValue(pieces[2])
  };
}

export function pemToPublicKey(pem: string): Promise<CryptoKey> {
  const der = base64StringToByteArray(pem);
  const certificate = parseCertificate(der);

  return crypto.subtle.importKey(
    'spki',
    certificate.tbsCertificate.subjectPublicKeyInfo.asn1.raw,
    {name: "RSASSA-PKCS1-v1_5", hash: {name: 'SHA-256'}},
    true,
    ["verify"]
  )
}
