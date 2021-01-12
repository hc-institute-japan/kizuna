const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function addContacts(username) {
    return (conductor) =>
      conductor.call("contacts", "add_contact", username);
};
  
function removeContacts(username) {
  return (conductor) =>
  conductor.call("contacts", "remove_contact", username);
};

function blockContact(username) {
  return (conductor) =>
  conductor.call("contacts", "block_contact", username);
};

  
function unblockContact(username) {
  return (conductor) =>
  conductor.call("contacts", "unblock_contact", username);
};

function listContacts() {
  return (conductor) => conductor.call("contacts", "list_contacts", null);
};

function listBlocked() {
  return (conductor) => conductor.call("contacts", "list_blocked", null);
};

function inContacts(agentPubKey) {
  return (conductor) => conductor.call("contacts", "in_contacts", agentPubKey)
};

function inBlocked(agentPubKey) {
  return (conductor) => conductor.call("contacts", "in_blocked", agentPubKey)
};
  
function setUsername(username) {
  return (conductor) => conductor.call("username", "set_username", username);
}

function getAgentPubkeyFromUsername(username) {
  return (conductor) => conductor.call("username", "get_agent_pubkey_from_username", username)
}

export default (orchestrator, config, installables) => {
  orchestrator.registerScenario("add a contact", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ]] = await conductor.installAgentsHapps(installables.two);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;

    const [dna_hash_1, agent_pubkey_alice] = alice_conductor.cellId;
    const [dna_hash_2, agent_pubkey_bobby] = bobby_conductor.cellId;
    console.log("alice address");
    console.log(agent_pubkey_alice);
    console.log("bobby address");
    console.log(agent_pubkey_bobby);

    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await delay(1000);

    const alice_add_contact_result_1 = await addContacts("bobby_123")(alice_conductor);
    const bobby_add_contact_result_2 = await addContacts("alice_123")(bobby_conductor);
    
    await delay(1000);

    // already added contacts
    const bobby_add_contact_result_3 =  await addContacts("alice_123")(bobby_conductor);
    
    await delay(1000);

    t.deepEqual(alice_add_contact_result_1.agent_id, agent_pubkey_bobby);
    t.deepEqual(bobby_add_contact_result_2.agent_id, agent_pubkey_alice);
    t.deepEqual(bobby_add_contact_result_3.agent_id, agent_pubkey_alice);
    t.deepEqual(alice_add_contact_result_1.username, "bobby_123");
    t.deepEqual(bobby_add_contact_result_2.username, "alice_123");
    t.deepEqual(bobby_add_contact_result_3.username, "alice_123");
  });

  orchestrator.registerScenario("remove a contact", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ]] = await conductor.installAgentsHapps(installables.two);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;

    const [dna_hash_1, agent_pubkey_alice] = alice_conductor.cellId;
    const [dna_hash_2, agent_pubkey_bobby] = bobby_conductor.cellId;
    
    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await delay(1000);

    // remove a contact when no ContactsInfo has been instantiated
    const remove_contact_alice_result_1 = await removeContacts("bobby_123")(alice_conductor);

    await addContacts("alice_123")(alice_conductor);
    await addContacts("bobby_123")(alice_conductor);

    await delay(1000);

    const list_contacts_1 = await listContacts()(alice_conductor);
    
    const remove_contact_alice_result_2 = await removeContacts("bobby_123")(alice_conductor);

    await delay(1000);
    
    const list_contacts_2 = await listContacts()(alice_conductor);
  
    // removing a contact that is not in the list
    const remove_contact_alice_result_3 = await removeContacts("bobby_123")(alice_conductor);
    
    t.deepEqual(list_contacts_1, [agent_pubkey_alice, agent_pubkey_bobby]);
    t.deepEqual(list_contacts_2, [agent_pubkey_alice]);
    t.deepEqual(remove_contact_alice_result_2.agent_id, agent_pubkey_bobby);
    t.deepEqual(remove_contact_alice_result_2.username, "bobby_123");
    t.deepEqual(remove_contact_alice_result_1.agent_id, agent_pubkey_bobby);
    t.deepEqual(remove_contact_alice_result_1.username, "bobby_123");
    t.deepEqual(remove_contact_alice_result_2.agent_id, agent_pubkey_bobby);
    t.deepEqual(remove_contact_alice_result_2.username, "bobby_123");
    t.deepEqual(remove_contact_alice_result_3.agent_id, agent_pubkey_bobby);
    t.deepEqual(remove_contact_alice_result_3.username, "bobby_123");
  });

  orchestrator.registerScenario("list contacts", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ]] = await conductor.installAgentsHapps(installables.two);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;

    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await delay(1000);

    const empty_list_contacts = await listContacts()(alice_conductor);
    await addContacts("alice_123")(alice_conductor);
    await addContacts("bobby_123")(alice_conductor);
    
    await delay(1000);
    
    const list_contacts_1 = await listContacts()(alice_conductor);
    await removeContacts("bobby_123")(alice_conductor);

    await delay(1000);
    
    const list_contacts_2 = await listContacts()(alice_conductor);

    t.deepEqual(empty_list_contacts.length, 0);
    t.deepEqual(list_contacts_1.length, 2);
    t.deepEqual(list_contacts_2.length, 1);
  });

  orchestrator.registerScenario("block contact", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ], [clark_lobby_happ]] = await conductor.installAgentsHapps(installables.three);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;
    const [clark_conductor] = clark_lobby_happ.cells;
    
    const [dna_hash_1, agent_pubkey_alice] = alice_conductor.cellId;
    const [dna_hash_2, agent_pubkey_bobby] = bobby_conductor.cellId;
    const [dna_hash_3, agent_pubkey_clark] = clark_conductor.cellId;

    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await setUsername("clark_123")(clark_conductor);
    await delay(1000);

    // BLOCK MYSELF
    const block_myself_result = await blockContact("alice_123")(alice_conductor);
    await delay(1000);

    t.deepEqual(block_myself_result.agent_id, null);
    t.deepEqual(block_myself_result.username, null);

    //BLOCK A CONTACT NOT IN CONTACTS (ALSO INSTANTIATES CONTACTS)
    const block_contact_result_1 = await blockContact("clark_123")(alice_conductor);
    await delay(1000);

    //BLOCK A CONTACT IN CONTACTS
    await addContacts("alice_123")(alice_conductor);
    await addContacts("bobby_123")(alice_conductor);

    const list_contacts_1 = await listContacts()(alice_conductor);
    const block_contact_result_2 = await blockContact("bobby_123")(alice_conductor);

    await delay(1000);

    const list_contacts_2 = await listContacts()(alice_conductor);
    const list_blocked_1 = await listBlocked()(alice_conductor);
    
    // BLOCK AN ALREADY BLOCKED CONTACT
    await blockContact("bobby_123")(alice_conductor);
    
    await delay(1000);
    
    const list_blocked_2 = await listBlocked()(alice_conductor);

    t.deepEqual(block_contact_result_1.agent_id, agent_pubkey_clark);
    t.deepEqual(block_contact_result_1.username, "clark_123");
    t.deepEqual(block_contact_result_2.agent_id, agent_pubkey_bobby);
    t.deepEqual(block_contact_result_2.username, "bobby_123");
    t.deepEqual(list_contacts_1.length, 2);
    t.deepEqual(list_contacts_2.length, 1);
    t.deepEqual(list_blocked_1.length, 2);
    t.deepEqual(list_blocked_2.length, 2);
  });

  orchestrator.registerScenario("unblock contact", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ], [clark_lobby_happ]] = await conductor.installAgentsHapps(installables.three);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;
    const [clark_conductor] = clark_lobby_happ.cells;

    const [dna_hash_2, agent_pubkey_bobby] = bobby_conductor.cellId;

    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await setUsername("clark_123")(clark_conductor);
    await delay(1000);

    // UNBLOCK A CONTACT WHEN NO CONTACTINFO HAS BEEN INSTANTIATED
    const unblock_contact_result_1 = await unblockContact("bobby_123")(alice_conductor);
    await delay(1000);

    await addContacts("alice_123")(alice_conductor);
    await addContacts("bobby_123")(alice_conductor);
    await addContacts("clark_123")(alice_conductor);
    await delay(1000);
    
    await blockContact("bobby_123")(alice_conductor);
    await delay(1000);
    
    // UNBLOCK BLOCKED CONTACT
    const unblock_contact_result_2 = await unblockContact("bobby_123")(alice_conductor);
    await delay(1000);
    const list_blocked = await listBlocked()(alice_conductor);

    // UNBLOCK AN UNBLOCKED CONTACT
    const unblock_contact_result_3 = await unblockContact("bobby_123")(alice_conductor);
    await delay(1000);
    
    t.deepEqual(unblock_contact_result_1.agent_id, agent_pubkey_bobby);
    t.deepEqual(unblock_contact_result_1.username, "bobby_123");
    t.deepEqual(unblock_contact_result_2.agent_id, agent_pubkey_bobby);
    t.deepEqual(unblock_contact_result_2.username, "bobby_123");
    t.deepEqual(list_blocked.length, 0);
    t.deepEqual(unblock_contact_result_3.agent_id, agent_pubkey_bobby);
    t.deepEqual(unblock_contact_result_3.username, "bobby_123");
  });

  orchestrator.registerScenario("list blocked contacts", async (s, t) => {
    const [condcutor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ], [clark_lobby_happ]] = await condcutor.installAgentsHapps(installables.three);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;
    const [clark_conductor] = clark_lobby_happ.cells;

    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await setUsername("clark_123")(clark_conductor);
    await delay(1000);

    await addContacts("alice_123")(alice_conductor);
    await addContacts("bobby_123")(alice_conductor);
    await addContacts("clark_123")(alice_conductor);
    await delay(1000);

    const emtpy_block_list = await listBlocked()(alice_conductor);
    await blockContact("bobby_123")(alice_conductor);
    await blockContact("clark_123")(alice_conductor);
    await delay(1000);
    
    const blocked_list_1 = await listBlocked()(alice_conductor);
    await unblockContact("bobby_123")(alice_conductor);
    await unblockContact("clark_123")(alice_conductor);
    await delay(1000);
    
    const blocked_list_2 = await listBlocked()(alice_conductor);
    await blockContact("bobby_123")(alice_conductor);
    await blockContact("clark_123")(alice_conductor);
    await delay(1000);

    const blocked_list_3 = await listBlocked()(alice_conductor);

    t.deepEqual(emtpy_block_list.length, 0);
    t.deepEqual(blocked_list_1.length, 2);
    t.deepEqual(blocked_list_2.length, 0);
    t.deepEqual(blocked_list_3.length, 2);
  });

  orchestrator.registerScenario("check in contacts", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ], [clark_lobby_happ]] = await conductor.installAgentsHapps(installables.three);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;
    const [clark_conductor] = clark_lobby_happ.cells;
    
    const [dna_hash_1, agent_pubkey_alice] = alice_conductor.cellId;
    const [dna_hash_2, agent_pubkey_bobby] = bobby_conductor.cellId;
    const [dna_hash_3, agent_pubkey_clark] = clark_conductor.cellId;

    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await setUsername("clark_123")(clark_conductor);
    await delay(1000);

    await addContacts("alice_123")(alice_conductor);
    await addContacts("bobby_123")(alice_conductor);

    await delay(1000);

    const in_contacts_1 = await inContacts(agent_pubkey_alice)(alice_conductor);
    const in_contacts_2 = await inContacts(agent_pubkey_bobby)(alice_conductor);
    const in_contacts_3 = await inContacts(agent_pubkey_clark)(alice_conductor);

    t.deepEqual(in_contacts_1, true);
    t.deepEqual(in_contacts_2, true);
    t.deepEqual(in_contacts_3, false);
  });

  orchestrator.registerScenario("check in blocked list", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ], [clark_lobby_happ]] = await conductor.installAgentsHapps(installables.three);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;
    const [clark_conductor] = clark_lobby_happ.cells;
    
    const [dna_hash_1, agent_pubkey_alice] = alice_conductor.cellId;
    const [dna_hash_2, agent_pubkey_bobby] = bobby_conductor.cellId;
    const [dna_hash_3, agent_pubkey_clark] = clark_conductor.cellId;

    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await setUsername("clark_123")(clark_conductor);
    await delay(1000);

    await blockContact("bobby_123")(alice_conductor);
    await blockContact("clark_123")(alice_conductor);

    await delay(1000);

    const in_contacts_1 = await inBlocked(agent_pubkey_alice)(alice_conductor);
    const in_contacts_2 = await inBlocked(agent_pubkey_bobby)(alice_conductor);
    const in_contacts_3 = await inBlocked(agent_pubkey_clark)(alice_conductor);

    t.deepEqual(in_contacts_1, false);
    t.deepEqual(in_contacts_2, true);
    t.deepEqual(in_contacts_3, true);
  });
};
  