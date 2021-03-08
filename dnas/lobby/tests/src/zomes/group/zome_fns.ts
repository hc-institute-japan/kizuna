import { cond, filter } from "lodash";
import { Base64 } from "js-base64";
import blake from "blakejs";

export function init(conductor) {
  conductor.call("group", "init");
}

export function createGroup(create_group_input) {
  return (conductor) =>
    conductor.call("group", "create_group", create_group_input);
}

export function AddGroupMebers(update_members_io) {
  return (conductor) =>
    conductor.call("group", "add_members", update_members_io);
}

export function removeGroupMembers(remove_members_io) {
  return (conductor) =>
    conductor.call("group", "remove_members", remove_members_io);
}

export function getLatestGroupVersion(group_entry_hash) {
  return (coductor) =>
    coductor.call("group", "get_group_latest_version", group_entry_hash);
}

export function updateGroupName(update_group_name_io) {
  return (conductor) =>
    conductor.call("group", "update_group_name", update_group_name_io);
}

export function getMyGroupsList(conductor) {
  return conductor.call("group", "get_all_my_groups", null);
}

// Group Message related functions
export function indicateGroupTyping(group_typing_detail_data) {
  return (conductor) =>
    conductor.call("group", "indicate_group_typing", group_typing_detail_data);
}

export function readGroupMessage(group_message_read_io) {
  return (conductor) =>
    conductor.call("group", "read_group_message", group_message_read_io);
}

export async function sendMessage(
  conductor,
  { groupId, sender, payloadInput }
) {
  return await conductor.call("group", "send_message", {
    groupHash: groupId,
    payloadInput,
    sender,
  });
}

export function getMessagesByGroupByTimestamp(message_info) {
  return (conductor) =>
    conductor.call("group", "get_messages_by_group_by_timestamp", message_info);
}

export function signalHandler(signal, signal_listener) {
  /*
    //this is the incoming signal format
    signal = { 
        type: String, 
        data: { 
            cellId: Hash, 
            payload: SignalDetails { 
                name : String, 
                payload : SignalPayload, 
            } 
        }
    }
    */

  signal_listener.counter++;
  return (payload) => {
    signal_listener.payload = signal.data.payload.payload;
  };
}

// VAlIDATION FUCNTIONS
export function runValidationRules(validation_input) {
  return (conductor) =>
    conductor.call("group", "run_validation", validation_input);
}

export function getNextBatchGroupMessage(filter_input) {
  return (conductor) =>
    conductor.call("group", "get_next_batch_group_messages", filter_input);
}

export async function sendMessageWithDate(
  conductor,
  { groupId, sender, payload, date = Date.now() }
) {
  return await conductor.call("group", "send_message_in_target_date", {
    groupHash: groupId,
    payload,
    sender,
    date,
  });
}

export function getLatestMessagesForAllGroups(batch_size) {
  return async (conductor) =>
    await conductor.call(
      "group",
      "get_latest_messages_for_all_groups",
      batch_size
    );
}

//HELPERS FUNCTIONS FOR TESTING SENDING FILE MESSAGES

export function strToUtf8Bytes(str) {
  const bytes: Array<number> = [];

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i); // x00-xFFFF
    bytes.push(code & 255); // low, high
  }

  return bytes;
}

declare type Dictionary<T> = { [key: string]: T };
declare type Hash = string;

export function serializeHash(hash) {
  return `u${Base64.fromUint8Array(hash, true)}`;
}

export enum HashType {
  AGENT,
  ENTRY,
  DHTOP,
  HEADER,
  DNA,
}

const AGENT_PREFIX = "hCAk";
const ENTRY_PREFIX = "hCEk";
const DHTOP_PREFIX = "hCQk";
const DNA_PREFIX = "hC0k";
const HEADER_PREFIX = "hCkk";

function getPrefix(type: HashType) {
  switch (type) {
    case HashType.AGENT:
      return AGENT_PREFIX;
    case HashType.ENTRY:
      return ENTRY_PREFIX;
    case HashType.DHTOP:
      return DHTOP_PREFIX;
    case HashType.HEADER:
      return HEADER_PREFIX;
    case HashType.DNA:
      return DNA_PREFIX;
  }
}

function str2ab(str: string) {
  var buf = new ArrayBuffer(str.length);
  var bufView = new Uint8Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export const hashCache: Dictionary<Hash> = {};

// From https://github.com/holochain/holochain/blob/dc0cb61d0603fa410ac5f024ed6ccfdfc29715b3/crates/holo_hash/src/encode.rs
export function hash(content: any, type: HashType): Hash {
  const contentString =
    typeof content === "string" ? content : JSON.stringify(content);

  if (hashCache[contentString]) return hashCache[contentString];

  const hashable = new Uint8Array(str2ab(contentString));

  const bytesHash = blake.blake2b(hashable, null, 32);

  const strHash = serializeHash(bytesHash);
  const hash = `u${getPrefix(type)}${strHash.slice(1)}`;

  hashCache[contentString] = hash;

  return hash;
}
