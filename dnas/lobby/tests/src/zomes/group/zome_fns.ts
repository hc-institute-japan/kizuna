import { Cell } from "@holochain/tryorama";

export function init(conductor: Cell) {
  conductor.call("group", "init");
}

// group CRUD
export function createGroup(create_group_input) {
  return (conductor: Cell) =>
    conductor.call("group", "create_group", create_group_input);
}

export function AddGroupMebers(update_members_io) {
  return (conductor: Cell) =>
    conductor.call("group", "add_members", update_members_io);
}

export function removeGroupMembers(remove_members_io) {
  return (conductor: Cell) =>
    conductor.call("group", "remove_members", remove_members_io);
}

export function getAllMyGroups(conductor) {
  return conductor.call("group", "get_all_my_groups", null);
}

export function getLatestGroupVersion(group_entry_hash) {
  return (conductor: Cell) =>
    conductor.call("group", "get_group_latest_version", group_entry_hash);
}

export function updateGroupName(update_group_name_io) {
  return (conductor: Cell) =>
    conductor.call("group", "update_group_name", update_group_name_io);
}

// group message functions
export function indicateGroupTyping(group_typing_detail_data) {
  return (conductor: Cell) =>
    conductor.call("group", "indicate_group_typing", group_typing_detail_data);
}

export function readGroupMessage(group_message_read_io) {
  return (conductor: Cell) =>
    conductor.call("group", "read_group_message", group_message_read_io);
}

export async function sendMessage(
  conductor,
  { groupId, sender, payloadInput, replyTo = null }
) {
  return await conductor.call("group", "send_message", {
    groupHash: groupId,
    payloadInput,
    sender,
    ...(replyTo ? { replyTo } : {}),
  });
}

export function getMessagesByGroupByTimestamp(message_info) {
  return (conductor: Cell) =>
    conductor.call("group", "get_messages_by_group_by_timestamp", message_info);
}

export function getLatestMessagesForAllGroups(batch_size) {
  return async (conductor: Cell) =>
    await conductor.call(
      "group",
      "get_latest_messages_for_all_groups",
      batch_size
    );
}

export function getPreviousGroupMessages(filter_input) {
  return (conductor: Cell) =>
    conductor.call("group", "get_previous_group_messages", filter_input);
}

export async function sendMessageWithDate(
  conductor: Cell,
  { groupId, sender, payload, date = Date.now(), replyTo = undefined }
) {
  return await conductor.call("group", "send_message_in_target_date", {
    groupHash: groupId,
    payload,
    sender,
    date,
    ...(replyTo ? { replyTo } : {}),
  });
}

export function pinMessage(groupHash, groupMessageHash) {
  return (conductor: Cell) =>
    conductor.call("group", "pin_message", {
      groupHash,
      groupMessageHash,
    });
}

export function unpinMessage(groupHash, groupMessageHash) {
  return (conductor: Cell) =>
    conductor.call("group", "unpin_message", {
      groupHash,
      groupMessageHash,
    });
}

export function getPinnnedMessages(groupHash) {
  return (conductor: Cell) =>
    conductor.call("group", "get_pinned_messages", groupHash);
}

// signal
export function signalHandler(signal, signal_listener) {
  signal_listener.counter++;
  signal_listener.payload = signal.data.payload.payload;
}

// contacts
function blockContacts(agentPubKeys) {
  return (conductor) =>
    conductor.call("contacts", "block_contacts", agentPubKeys);
}

// VAlIDATION FUCNTIONS
export function runValidationRules(validation_input) {
  return (conductor) =>
    conductor.call("group", "run_validation", validation_input);
}
