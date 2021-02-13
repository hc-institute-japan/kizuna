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

export function sendMessage(conductor, { group_id, sender, payload_input }) {
  return conductor.call("group", "send_message", {
    group_hash: group_id,
    payload_input,
    sender,
  });
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
    console.log(`we have a new signal incoming ${payload}`);
    signal_listener.payload = signal.data.payload.payload;
  };
}

// VAlIDATION FUCNTIONS
export function runValidationRules(validation_input) {
  return (conductor) =>
    conductor.call("group", "run_validation", validation_input);
}
