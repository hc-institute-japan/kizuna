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
  return (conductor, caller) => conductor.call(caller, "profiles", "create_profile", username);
}

module.exports = (orchestrator, config) => {
  orchestrator.registerScenario("add a contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    // TODO
    // const set_username_alice = await setUsername("alice")(alice);
    // const set_username_bob = await setUsername("bob")(bob);
    // await s.consistency();

    const add_contact_result_1 = await addContacts("bobby")(conductor, "alice");
    const add_contact_result_2 = await addContacts("clark")(conductor, "alice");

    await delay(1000);

    // already added contacts
    await addContacts("clark")(conductor, "alice");
    
    await delay(1000);
    
    const list_contacts = await listContacts()(conductor, "alice");

    // t.deepEqual(add_contact_result.Ok.agent_id, bobAddress);
    t.deepEqual(add_contact_result_1.username, "bobby");
    // t.deepEqual(add_contact_result_2.Ok.agent_id, aliceAddress);
    t.deepEqual(add_contact_result_2.username, "clark");
    t.deepEqual(list_contacts.length, 2);


    
  });

  orchestrator.registerScenario("remove a contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    // TODO
    // const set_username_alice = await setUsername("alice")(alice);
    // const set_username_bob = await setUsername("bob")(bob);
    // await delay(1000);

    const add_contact_alice_result = await addContacts("bobby")(conductor, "alice");
    const add_contact_alice_result_2 = await addContacts("clark")(conductor, "alice");

    await delay(1000);

    const list_contacts = await listContacts()(conductor, "alice");
    
    const remove_contact_alice_result = await removeContacts("bobby")(conductor, "alice");

    await delay(1000);
    
    const list_contacts_2 = await listContacts()(conductor, "alice");
    
    // TODO
    // no address exisiting
    // const invalid_remove_1 = await removeContacts("bob", 4)(alice);
    
    t.deepEqual(list_contacts, ["bobby", "clark"]);
    t.deepEqual(list_contacts_2, ["clark"])
    t.deepEqual(add_contact_alice_result.username, "bobby");
    t.deepEqual(add_contact_alice_result_2.username, "clark");
    t.deepEqual(remove_contact_alice_result.username, "bobby");

    // TODO
    // t.deepEqual(JSON.parse(invalid_remove_1.Err.Internal).code, "404");
    // t.deepEqual(JSON.parse(invalid_remove_1.Err.Internal).message, "This address wasn't found in contacts");

    // t.deepEqual(JSON.parse(invalid_remove_2.Err.Internal).code, "321");
    // t.deepEqual(JSON.parse(invalid_remove_2.Err.Internal).message, "The timestamp is the same with or less than the previous timestamp");
  });

  orchestrator.registerScenario("list contacts", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    // TODO
    // const set_username_alice = await setUsername("alice")(alice);
    // const set_username_bob = await setUsername("bob")(bob);
    // await delay(1000);

    const empty_list_contacts = await listContacts()(conductor, "alice");
    const add_contact_alice_result = await addContacts("bobby")(conductor, "alice");
    const add_contact_alice_result_2 = await addContacts("clark")(conductor, "alice");
    
    await delay(1000);
    
    const list_contacts = await listContacts()(conductor, "alice");
    const remove_contact_alice_result = await removeContacts("bobby")(conductor, "alice");

    await delay(1000);
    
    const list_contacts_2 = await listContacts()(conductor, "alice");

    t.ok(add_contact_alice_result.username, "bobby");
    t.ok(add_contact_alice_result_2.username, "clark");
    t.ok(remove_contact_alice_result.username, "bobby");
    t.deepEqual(empty_list_contacts.length, 0);
    t.deepEqual(list_contacts.length, 2);
    t.deepEqual(list_contacts_2.length, 1);
  });

  orchestrator.registerScenario("block contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    // TODO
    // await setUsername("alice")(alice);
    // await setUsername("bob")(bob);
    // await setUsername("charlie")(charlie);
    // await s.consistency();

    // TODO
    //BLOCK OWN SELF
    // const invalid_block_contact_result_0 = await blockContact("alice")(conductor, "alice");
    // await delay(1000);

    // t.deepEqual(JSON.parse(invalid_block_contact_result_0.Err.Internal).code, "302");
    // t.deepEqual(JSON.parse(invalid_block_contact_result_0.Err.Internal).message, "Cannot block own agent id.");

    // TODO
    //BLOCK A CONTACT NOT IN CONTACTS (ALSO INSTANTIATES CONTACTS)
    // const block_contact_result_0 = await blockContact("charlie")(conductor, "alice");
    // await delay(1000);
    // t.deepEqual(block_contact_result_0.Ok.agent_id, charlieAddress);
    // t.deepEqual(block_contact_result_0.Ok.username, "charlie");

    //BLOCK A CONTACT IN CONTACTS
    await addContacts("bobby")(conductor, "alice");
    await addContacts("alice")(conductor, "alice");
    await addContacts("clark")(conductor, "alice");

    const list_contacts_1 = await listContacts()(conductor, "alice");
    const block_contact_result = await blockContact("bobby")(conductor, "alice");

    await delay(1000);

    const list_contacts_2 = await listContacts()(conductor, "alice");
    const list_blocked_1 = await listBlocked()(conductor, "alice");
    
    //BLOCK AN ALREADY BLOCKED CONTACT
    await blockContact("bobby")(conductor, "alice");
    
    await delay(1000);
    
    const list_blocked_2 = await listBlocked()(conductor, "alice");

    t.deepEqual(block_contact_result.username, "bobby");
    t.deepEqual(list_contacts_1.length, 3)
    t.deepEqual(list_contacts_2.length, 2)
    t.deepEqual(list_blocked_1.length, 1)
    t.deepEqual(list_blocked_2.length, 1)

  });

  orchestrator.registerScenario("unblock contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    // TODO
    // await setUsername("alice")(alice);
    // await setUsername("bob")(bob);
    // await s.consistency();

    await addContacts("bobby")(conductor, "alice");
    await addContacts("clark")(conductor, "alice");
    await addContacts("alice")(conductor, "alice");
    await delay(1000);

    const list_contacts_1 = await listContacts()(conductor, "alice");
    
    const block_contact_result = await blockContact("bobby")(conductor, "alice");
    await delay(1000);
    
    const list_blocked_1 = await listBlocked()(conductor, "alice");
    const list_contacts_2 = await listContacts()(conductor, "alice");
    
    //UNBLOCK BLOCKED CONTACT
    const unblock_contact_result = await unblockContact("bobby")(conductor, "alice");
    await delay(1000);
    const list_blocked_2 = await listBlocked()(conductor, "alice");
    
    t.deepEqual(block_contact_result.username, "bobby");
    t.deepEqual(unblock_contact_result.username, "bobby");
    t.deepEqual(list_contacts_1.length, 3)
    t.deepEqual(list_blocked_1.length, 1)
    t.deepEqual(list_contacts_2.length, 2)
    t.deepEqual(list_blocked_2.length, 0)


    // TODO
    // //UNBLOCK AN UNBLOCKED CONTACT
    // const invalid_unblock_contact_result_2 = await unblockContact("clark")(conductor, "alice");
    // await delay(1000);
    // // t.deepEqual(invalid_unblock_contact_result_2.Err, {
    // //   Internal: "The contact is not in the list of blocked contacts",
    // // });

    // t.deepEqual(JSON.parse(invalid_unblock_contact_result_2.Err.Internal).code, "404");
    // t.deepEqual(JSON.parse(invalid_unblock_contact_result_2.Err.Internal).message, "The contact is not in the list of blocked contacts");
  });

  orchestrator.registerScenario("list blocked contacts", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    await addContacts("bobby")(conductor, "alice");
    await addContacts("clark")(conductor, "alice");
    await addContacts("alice")(conductor, "alice");
    await delay(1000);

    const emtpy_block_list = await listBlocked()(conductor, "alice");
    await blockContact("bobby")(conductor, "alice");
    await blockContact("clark")(conductor, "alice");
    await delay(1000);
    
    const blocked_list_1 = await listBlocked()(conductor, "alice");
    await unblockContact("bobby")(conductor, "alice");
    await unblockContact("clark")(conductor, "alice");
    await delay(1000);
    
    const blocked_list_2 = await listBlocked()(conductor, "alice");
    await blockContact("clark")(conductor, "alice");
    await blockContact("bobby")(conductor, "alice");
    await blockContact("danny")(conductor, "alice");
    await delay(1000);

    const blocked_list_3 = await listBlocked()(conductor, "alice");

    t.deepEqual(emtpy_block_list.length, 0);
    t.deepEqual(blocked_list_1.length, 2);
    t.deepEqual(blocked_list_2.length, 0);
    t.deepEqual(blocked_list_3.length, 3);
  });

  orchestrator.registerScenario("check in contacts", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    await addContacts("bobby")(conductor, "alice");
    await addContacts("clark")(conductor, "alice");
    await addContacts("alice")(conductor, "alice");

    await delay(1000);

    const in_contacts_1 = await inContacts("bobby")(conductor, "alice");
    const in_contacts_2 = await inContacts("clark")(conductor, "alice");
    const in_contacts_3 = await inContacts("abcdf")(conductor, "alice");

    t.deepEqual(in_contacts_1, true);
    t.deepEqual(in_contacts_2, true);
    t.deepEqual(in_contacts_3, false);
  });

  // orchestrator.registerScenario("testing", async (s, t) => {
  //   const { conductor } = await s.players({ conductor: config });
  //   await conductor.spawn();

  //   const [dna_hash, agent_address] = conductor.cellId('alice')

  //   const set_username_alice_result_1 = await setUsername({ username : "alice"})(conductor, "alice");
  //   await delay(1000);

  //   const get_pubkey = await conductor.call("alice", "contacts", "get_agent_pubkey_from_username", "alice");
  //   console.log("tatsuya1");
  //   console.log(set_username_alice_result_1);
  //   console.log(agent_address);
  //   console.log(get_pubkey);
  // });
};
  