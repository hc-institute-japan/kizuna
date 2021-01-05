import {PubKey, PubKeyArray} from './types';

export const convert = (pubkey: PubKeyArray): PubKey => ({
  hash: Uint8Array.from(pubkey.hash),
  hash_type: Uint8Array.from(pubkey.hash_type),
});
