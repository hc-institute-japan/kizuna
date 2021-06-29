import { IntlShape } from "react-intl";
import { useDispatch } from "react-redux";
import { IndexedContacts } from "../redux/contacts/types";
import { Payload } from "../redux/commons/types";
import { Profile } from "../redux/profile/types";
import { ReduxDispatch } from "../redux/types";
import { deserializeHash } from "@holochain-open-dev/core-types";
import { useCallback, useRef, useState } from "react";

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

export const monthToString = (month: number, intl: IntlShape) => {
  switch (month) {
    case 0:
      return intl.formatMessage({ id: "app.group-chat.media.month.1" })!;
    case 1:
      return intl.formatMessage({ id: "app.group-chat.media.month.2" })!;
    case 2:
      return intl.formatMessage({ id: "app.group-chat.media.month.3" })!;
    case 3:
      return intl.formatMessage({ id: "app.group-chat.media.month.4" })!;
    case 4:
      return intl.formatMessage({ id: "app.group-chat.media.month.5" })!;
    case 5:
      return intl.formatMessage({ id: "app.group-chat.media.month.6" })!;
    case 6:
      return intl.formatMessage({ id: "app.group-chat.media.month.7" })!;
    case 7:
      return intl.formatMessage({ id: "app.group-chat.media.month.8" })!;
    case 8:
      return intl.formatMessage({ id: "app.group-chat.media.month.9" })!;
    case 9:
      return intl.formatMessage({ id: "app.group-chat.media.month.10" })!;
    case 10:
      return intl.formatMessage({ id: "app.group-chat.media.month.11" })!;
    case 11:
      return intl.formatMessage({ id: "app.group-chat.media.month.12" })!;
    default:
      break;
  }
};

export const indexContacts: (contacts: Profile[]) => IndexedContacts = (
  contacts
) => {
  let indexedContacts: IndexedContacts = {};
  if (contacts.length > 0) {
    let char = contacts[0].username.charAt(0).toUpperCase();
    indexedContacts[char] = [];
    contacts.forEach((contact: Profile) => {
      const currChar = contact.username.charAt(0).toUpperCase();
      if (currChar !== char) {
        char = currChar;
        indexedContacts[char] = [];
      }
      const currArr = indexedContacts[currChar];
      currArr.push(contact);
    });
  }
  const orderedIndexedContacts = Object.keys(indexedContacts)
    .sort()
    .reduce((obj: any, key: any) => {
      obj[key] = indexedContacts[key];
      return obj;
    }, {});
  return orderedIndexedContacts;
};

export const debounce: (callback: () => any, delay?: number) => Function = (
  callback,
  delay = 500
) => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  };
};

export const useAppDispatch = () => useDispatch<ReduxDispatch>();

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

export const timestampToDate = (timestamp: number[]) => {
  let { 0: seconds, 1: nanoseconds } = timestamp;
  let date = new Date(seconds * 1000 + nanoseconds * 10 ** -6);
  return date;
};

export const dateToTimestamp = (date: Date) => {
  let milliseconds = date.getTime();
  let seconds = (milliseconds / 1000) >> 0;
  let nanoseconds = (milliseconds % 1000) * 10 ** 6;
  let ret: [number, number] = [seconds, nanoseconds];
  return ret;
};

export const isTextPayload = (payload: Payload) => payload?.type === "TEXT";

export const usePressHandlers = (
  onLongPress: (event: MouseEvent) => any,
  onClick: (event: MouseEvent) => any,
  { shouldPreventDefault = true, delay = 300 } = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<HTMLElement>();

  const start = useCallback(
    (event) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, {
          passive: false,
        });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && !longPressTriggered && onClick(event);
      setLongPressTriggered(false);
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  return {
    onMouseDown: (e: any) => start(e),
    onTouchStart: (e: any) => start(e),
    onMouseUp: (e: any) => clear(e),
    onMouseLeave: (e: any) => clear(e, false),
    onTouchEnd: (e: any) => clear(e),
  };
};

const isTouchEvent = (event: Event) => {
  return "touches" in event;
};

const preventDefault = (event: TouchEvent) => {
  if (!isTouchEvent(event)) return;

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};
