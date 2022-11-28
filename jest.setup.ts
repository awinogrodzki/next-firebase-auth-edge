import { Crypto } from "@peculiar/webcrypto"
import 'isomorphic-fetch';

(global as any).crypto = new Crypto()
