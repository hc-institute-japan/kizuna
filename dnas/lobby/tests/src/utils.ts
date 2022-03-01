import { Base64 } from "js-base64";

export const delay = (ms = 1500) => new Promise((r) => setTimeout(r, ms));
export const dateToTimestamp = (date: Date) => date.getTime() * 1000;

export const serializeHash = (hash) => {
  return `u${Base64.fromUint8Array(hash, true)}`;
};
