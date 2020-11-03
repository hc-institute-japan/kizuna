// Contacts Zome
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

// Username Zome
export function setUsername(username) {
  return (conductor, caller) => conductor.call(caller, "username", "set_username", username);
}

export function getAgentPubkeyFromUsername(username) {
  return (conductor, caller) => conductor.call(caller, "username", "get_agent_pubkey_from_username", username)
}