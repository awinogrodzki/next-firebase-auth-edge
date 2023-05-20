import * as runtime from "@edge-runtime/ponyfill";
import "isomorphic-fetch";

(global as any).crypto = runtime.crypto;
(global as any).caches = runtime.caches;
