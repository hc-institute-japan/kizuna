import { deserializeHash } from "@holochain-open-dev/core-types";
import { Payload } from "../../redux/commons/types";
import { IndexedContacts } from "../../redux/contacts/types";
import { Profile } from "../../redux/profile/types";

/*
  returns a new object with each value mapped using mapFn(value)
  optional keyFn if user wants to uniformly edit the keys as well
*/
export const objectMap = (
  object: any,
  mapFn: (v: any) => any,
  keyFn?: (v: string) => string
): any => {
  return Object.keys(object).reduce((result: any, key) => {
    let newKey: string | undefined;
    if (keyFn) newKey = keyFn(key);
    newKey
      ? (result[newKey] = mapFn(object[key]))
      : (result[key] = mapFn(object[key]));
    return result;
  }, {});
};

export const indexContacts: (contacts: Profile[]) => IndexedContacts = (
  contacts
) => {
  let indexedContacts: IndexedContacts = {};

  const sortedContacts = contacts.sort((a, b) =>
    a.username.toLocaleLowerCase().localeCompare(b.username.toLocaleLowerCase())
  );

  if (sortedContacts.length > 0) {
    sortedContacts.forEach((contact: Profile) => {
      const currChar = contact.username.charAt(0).toLocaleLowerCase();
      let currArr = indexedContacts[currChar];

      if (currArr === undefined) {
        indexedContacts[currChar] = [];
        currArr = indexedContacts[currChar];
      }
      currArr.push(contact);
    });
  }

  return indexedContacts;
};

export const convertCamelToSnake = (arg: string) =>
  arg.replace(/([A-Z])/g, "_$1").toLowerCase();

export const convertSnakeToCamel = (arg: string) =>
  arg.replace(/([-_]\w)/g, (g) => g[1].toUpperCase());

export const deserializeAgentPubKey = (agentPubKey: string) =>
  Buffer.from(deserializeHash(agentPubKey).buffer);

export const convertSizeToReadableSize = (size: number) =>
  size / 1024 / 1024 >= 1
    ? `${(size / 1024 / 1024).toFixed(2)}mb`
    : `${(size / 1024).toFixed(2)}kb`;

type SearchContacts = (
  contacts: { [key: string]: Profile },
  username: string
) => Profile | undefined;

export const searchContacts: SearchContacts = (contacts, username) =>
  Object.values(contacts).find((curr) => username === curr.username);

export const isTextPayload = (payload: Payload) => payload.type === "TEXT";

export const binaryToUrl = (hash: string) =>
  URL.createObjectURL(
    new Blob([deserializeHash(hash)], { type: "image/jpeg" })
  );

export const getEntryFromRecord = (record: any) => record.entry.Present.entry;

const ConversionService = {
  // binaryToUrl,
  isTextPayload,
  searchContacts,
  convertCamelToSnake,
  convertSnakeToCamel,
  convertSizeToReadableSize,
  deserializeAgentPubKey,
  indexContacts,
  objectMap,
  getEntryFromRecord,
};

export default ConversionService;
