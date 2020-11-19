const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function addContacts(username) {
    return (conductor, caller) =>
      conductor.call(caller, "contacts", "add_contact", username);
};
  
function removeContacts(username) {
  return (conductor, caller) =>
  conductor.call(caller, "contacts", "remove_contact", username);
};

function blockContact(username) {
  return (conductor, caller) =>
  conductor.call(caller, "contacts", "block_contact", username);
};

  
function unblockContact(username) {
  return (conductor, caller) =>
  conductor.call(caller, "contacts", "unblock_contact", username);
};

function listContacts() {
  return (conductor, caller) => conductor.call(caller, "contacts", "list_contacts", null);
};

function listBlocked() {
  return (conductor, caller) => conductor.call(caller, "contacts", "list_blocked", null);
};

function inContacts(username) {
  return (conductor, caller) => conductor.call(caller, "contacts", "in_contacts", username)
};
  
function setUsername(username) {
  return (conductor, caller) => conductor.call(caller, "username", "set_username", username);
}

function getAgentPubkeyFromUsername(username) {
  return (conductor, caller) => conductor.call(caller, "username", "get_agent_pubkey_from_username", username)
}

export default (orchestrator, config) => {
  orchestrator.registerScenario("add a contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const [dna_hash_1, agent_pubkey_alice] = conductor.cellId('alice');
    const [dna_hash_2, agent_pubkey_bobby] = conductor.cellId('bobby');

    await setUsername("alice_123")(conductor, "alice");
    await setUsername("bobby_123")(conductor, "bobby");
    await delay(1000);

    const alice_add_contact_result_1 = await addContacts("bobby_123")(conductor, "alice");
    const bobby_add_contact_result_2 = await addContacts("alice_123")(conductor, "bobby");
    
    await delay(1000);

    // already added contacts
    const bobby_add_contact_result_3 =  await addContacts("alice_123")(conductor, "bobby");
    
    await delay(1000);

    t.deepEqual(alice_add_contact_result_1.agent_id, agent_pubkey_bobby);
    t.deepEqual(bobby_add_contact_result_2.agent_id, agent_pubkey_alice);
    t.deepEqual(bobby_add_contact_result_3.agent_id, agent_pubkey_alice);
    t.deepEqual(alice_add_contact_result_1.username, "bobby_123");
    t.deepEqual(bobby_add_contact_result_2.username, "alice_123");
    t.deepEqual(bobby_add_contact_result_3.username, "alice_123");
  });

  orchestrator.registerScenario("remove a contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const [dna_hash_1, agent_pubkey_alice] = conductor.cellId('alice');
    const [dna_hash_2, agent_pubkey_bobby] = conductor.cellId('bobby');
    
    await setUsername("alice_123")(conductor, "alice");
    await setUsername("bobby_123")(conductor, "bobby");
    await delay(1000);

    // remove a contact when no ContactsInfo has been instantiated
    const remove_contact_alice_result_1 = await removeContacts("bobby_123")(conductor, "alice");

    await addContacts("alice_123")(conductor, "alice");
    await addContacts("bobby_123")(conductor, "alice");

    await delay(1000);

    const list_contacts_1 = await listContacts()(conductor, "alice");
    
    const remove_contact_alice_result_2 = await removeContacts("bobby_123")(conductor, "alice");

    await delay(1000);
    
    const list_contacts_2 = await listContacts()(conductor, "alice");
  
    // removing a contact that is not in the list
    const remove_contact_alice_result_3 = await removeContacts("bobby_123")(conductor, "alice");
    
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
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    await setUsername("alice_123")(conductor, "alice");
    await setUsername("bobby_123")(conductor, "bobby");
    await delay(1000);

    const empty_list_contacts = await listContacts()(conductor, "alice");
    await addContacts("alice_123")(conductor, "alice");
    await addContacts("bobby_123")(conductor, "alice");
    
    await delay(1000);
    
    const list_contacts_1 = await listContacts()(conductor, "alice");
    await removeContacts("bobby_123")(conductor, "alice");

    await delay(1000);
    
    const list_contacts_2 = await listContacts()(conductor, "alice");

    t.deepEqual(empty_list_contacts.length, 0);
    t.deepEqual(list_contacts_1.length, 2);
    t.deepEqual(list_contacts_2.length, 1);
  });

  orchestrator.registerScenario("block contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const [dna_hash_1, agent_pubkey_alice] = conductor.cellId('alice');
    const [dna_hash_2, agent_pubkey_bobby] = conductor.cellId('bobby');
    const [dna_hash_3, agent_pubkey_clark] = conductor.cellId('clark');

    await setUsername("alice_123")(conductor, "alice");
    await setUsername("bobby_123")(conductor, "bobby");
    await setUsername("clark_123")(conductor, "clark");
    await delay(1000);

    // BLOCK MYSELF
    const block_myself_result = await blockContact("alice_123")(conductor, "alice");
    await delay(1000);

    t.deepEqual(block_myself_result.agent_id, null);
    t.deepEqual(block_myself_result.username, null);

    //BLOCK A CONTACT NOT IN CONTACTS (ALSO INSTANTIATES CONTACTS)
    const block_contact_result_1 = await blockContact("clark_123")(conductor, "alice");
    await delay(1000);

    //BLOCK A CONTACT IN CONTACTS
    await addContacts("alice_123")(conductor, "alice");
    await addContacts("bobby_123")(conductor, "alice");

    const list_contacts_1 = await listContacts()(conductor, "alice");
    const block_contact_result_2 = await blockContact("bobby_123")(conductor, "alice");

    await delay(1000);

    const list_contacts_2 = await listContacts()(conductor, "alice");
    const list_blocked_1 = await listBlocked()(conductor, "alice");
    
    // BLOCK AN ALREADY BLOCKED CONTACT
    await blockContact("bobby_123")(conductor, "alice");
    
    await delay(1000);
    
    const list_blocked_2 = await listBlocked()(conductor, "alice");

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
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const [dna_hash_2, agent_pubkey_bobby] = conductor.cellId('bobby');

    await setUsername("alice_123")(conductor, "alice");
    await setUsername("bobby_123")(conductor, "bobby");
    await setUsername("clark_123")(conductor, "clark");
    await delay(1000);

    // UNBLOCK A CONTACT WHEN NO CONTACTINFO HAS BEEN INSTANTIATED
    const unblock_contact_result_1 = await unblockContact("bobby_123")(conductor, "alice");
    await delay(1000);

    await addContacts("alice_123")(conductor, "alice");
    await addContacts("bobby_123")(conductor, "alice");
    await addContacts("clark_123")(conductor, "alice");
    await delay(1000);
    
    await blockContact("bobby_123")(conductor, "alice");
    await delay(1000);
    
    // UNBLOCK BLOCKED CONTACT
    const unblock_contact_result_2 = await unblockContact("bobby_123")(conductor, "alice");
    await delay(1000);
    const list_blocked = await listBlocked()(conductor, "alice");

    // UNBLOCK AN UNBLOCKED CONTACT
    const unblock_contact_result_3 = await unblockContact("bobby_123")(conductor, "alice");
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
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    await setUsername("alice_123")(conductor, "alice");
    await setUsername("bobby_123")(conductor, "bobby");
    await setUsername("clark_123")(conductor, "clark");
    await delay(1000);

    await addContacts("alice_123")(conductor, "alice");
    await addContacts("bobby_123")(conductor, "alice");
    await addContacts("clark_123")(conductor, "alice");
    await delay(1000);

    const emtpy_block_list = await listBlocked()(conductor, "alice");
    await blockContact("bobby_123")(conductor, "alice");
    await blockContact("clark_123")(conductor, "alice");
    await delay(1000);
    
    const blocked_list_1 = await listBlocked()(conductor, "alice");
    await unblockContact("bobby_123")(conductor, "alice");
    await unblockContact("clark_123")(conductor, "alice");
    await delay(1000);
    
    const blocked_list_2 = await listBlocked()(conductor, "alice");
    await blockContact("bobby_123")(conductor, "alice");
    await blockContact("clark_123")(conductor, "alice");
    await delay(1000);

    const blocked_list_3 = await listBlocked()(conductor, "alice");

    t.deepEqual(emtpy_block_list.length, 0);
    t.deepEqual(blocked_list_1.length, 2);
    t.deepEqual(blocked_list_2.length, 0);
    t.deepEqual(blocked_list_3.length, 2);
  });

  orchestrator.registerScenario("check in contacts", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const [dna_hash_1, agent_pubkey_alice] = conductor.cellId('alice');
    const [dna_hash_2, agent_pubkey_bobby] = conductor.cellId('bobby');
    const [dna_hash_3, agent_pubkey_clark] = conductor.cellId('clark');

    await setUsername("alice_123")(conductor, "alice");
    await setUsername("bobby_123")(conductor, "bobby");
    await setUsername("clark_123")(conductor, "clark");
    await delay(1000);

    let alice_key = await getAgentPubkeyFromUsername("alice_123")(conductor, "alice");
    let bobby_key = await getAgentPubkeyFromUsername("bobby_123")(conductor, "alice");

    await addContacts("alice_123")(conductor, "alice");
    await addContacts("bobby_123")(conductor, "alice");

    await delay(1000);

    const in_contacts_1 = await inContacts(agent_pubkey_alice)(conductor, "alice");
    const in_contacts_2 = await inContacts(agent_pubkey_bobby)(conductor, "alice");
    const in_contacts_3 = await inContacts(agent_pubkey_clark)(conductor, "alice");

    t.deepEqual(in_contacts_1, true);
    t.deepEqual(in_contacts_2, true);
    t.deepEqual(in_contacts_3, false);
  });
};
  