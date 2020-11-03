/*
 * contacts zome
 */
export function addContacts(username) {
    return (conductor, caller) =>
      conductor.call(caller, "contacts", "add_contact", username);
};
  
export function removeContacts(username) {
  return (conductor, caller) =>
  conductor.call(caller, "contacts", "remove_contact", username);
};

export function blockContact(username) {
  return (conductor, caller) =>
  conductor.call(caller, "contacts", "block_contact", username);
};
  
export function unblockContact(username) {
  return (conductor, caller) =>
  conductor.call(caller, "contacts", "unblock_contact", username);
};

export function listContacts() {
  return (conductor, caller) => conductor.call(caller, "contacts", "list_contacts", null);
};

export function listBlocked() {
  return (conductor, caller) => conductor.call(caller, "contacts", "list_blocked", null);
};

export function inContacts(username) {
  return (conductor, caller) => conductor.call(caller, "contacts", "in_contacts", username)
};

/*
 * username zome
 */
export function setUsername(username) {
  return (conductor, caller) => conductor.call(caller, "username", "set_username", username);
}

export function getAgentPubkeyFromUsername(username) {
  return (conductor, caller) => conductor.call(caller, "username", "get_agent_pubkey_from_username", username)
}

/*
 * p2pmessage zome functions
 */
export function send_message(message) {
  return (conductor, caller) =>
    conductor.call(caller, "p2pmessage", "send_message", message);
};

export function receive_message() {
  return (conductor, caller) =>
    conductor.call(caller, "p2pmessage", "receive_message", null);
};

export function get_all_messages() {
  return (conductor, caller) =>
    conductor.call(caller, "p2pmessage", "get_all_messages", null);
}

export function get_all_messages_from_addresses(agentlist) {
  return (conductor, caller) =>
    conductor.call(caller, "p2pmessage", "get_all_messages_from_addresses", agentlist);
}

export function get_batch_messages_on_conversation(messagerange) {
  return (conductor, caller) => 
    conductor.call(caller, "p2pmessage", "get_batch_messages_on_conversation", messagerange);
}