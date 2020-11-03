import {
  addContacts,
  removeContacts,
  blockContact,
  unblockContact,
  listContacts,
  listBlocked,
  inContacts,
  setUsername,
  getAgentPubkeyFromUsername
} from '../functions';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default (orchestrator, config) => {
  orchestrator.registerScenario("add a contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const [dna_hash_1, agent_pubkey_alice] = conductor.cellId('alice');
    const [dna_hash_2, agent_pubkey_bobby] = conductor.cellId('bobby');

    const set_username_alice = await setUsername("alice")(conductor, "alice");
    const set_username_bobbo = await setUsername("bobby")(conductor, "bobby");
    await delay(1000);
    console.log("set username...");
    console.log(set_username_alice)
    console.log(set_username_bobbo)

    // temporary check of whether username actually belongs to a agent_pubkey
    let alice_key = await getAgentPubkeyFromUsername("alice")(conductor, "bobby");
    let bobby_key = await getAgentPubkeyFromUsername("bobby")(conductor, "alice");
    console.log("agent pub keys...")
    console.log(alice_key)
    console.log(bobby_key)


    const add_contact_result_1 = await addContacts(bobby_key)(conductor, "alice");
    const add_contact_result_2 = await addContacts(alice_key)(conductor, "alice");

    await delay(1000);

    // // already added contacts
    // await addContacts("alice")(conductor, "alice");
    
    await delay(1000);
    
    const list_contacts = await listContacts()(conductor, "alice");

    t.deepEqual(add_contact_result_1.agent_id, agent_pubkey_bobby);
    // t.deepEqual(add_contact_result_1.username, "alice");
    t.deepEqual(add_contact_result_2.agent_id, agent_pubkey_alice);
    // t.deepEqual(add_contact_result_2.username, "bobby");
    t.deepEqual(list_contacts.length, 2);
  });

  orchestrator.registerScenario("remove a contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    // TODO
    const set_username_alice = await setUsername("alice")(conductor, "alice");
    const set_username_bob = await setUsername("bobby")(conductor, "bobby");
    await delay(1000);

    let alice_key = await getAgentPubkeyFromUsername("alice")(conductor, "bobby");
    let bobby_key = await getAgentPubkeyFromUsername("bobby")(conductor, "alice");

    const add_contact_alice_result_1 = await addContacts(bobby_key)(conductor, "alice");
    const add_contact_alice_result_2 = await addContacts(alice_key)(conductor, "alice");

    await delay(1000);

    const list_contacts = await listContacts()(conductor, "alice");
    
    const remove_contact_alice_result = await removeContacts(bobby_key)(conductor, "alice");

    await delay(1000);
    
    const list_contacts_2 = await listContacts()(conductor, "alice");
    
    // TODO
    // no address exisiting
    // const invalid_remove_1 = await removeContacts("bob", 4)(alice);
    
    t.deepEqual(list_contacts, [bobby_key, alice_key]);
    t.deepEqual(list_contacts_2, [alice_key]);
    t.deepEqual(add_contact_alice_result_1.agent_id, bobby_key);
    t.deepEqual(add_contact_alice_result_2.agent_id, alice_key);
    t.deepEqual(remove_contact_alice_result.agent_id, bobby_key);

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
    const set_username_alice = await setUsername("alice")(conductor, "alice");
    const set_username_bob = await setUsername("bobby")(conductor, "bobby");
    await delay(1000);

    let alice_key = await getAgentPubkeyFromUsername("alice")(conductor, "bobby");
    let bobby_key = await getAgentPubkeyFromUsername("bobby")(conductor, "alice");

    const empty_list_contacts = await listContacts()(conductor, "alice");
    const add_contact_alice_result_1 = await addContacts(bobby_key)(conductor, "alice");
    const add_contact_alice_result_2 = await addContacts(alice_key)(conductor, "alice");
    
    await delay(1000);
    
    const list_contacts_1 = await listContacts()(conductor, "alice");
    const remove_contact_alice_result = await removeContacts(bobby_key)(conductor, "alice");

    await delay(1000);
    
    const list_contacts_2 = await listContacts()(conductor, "alice");

    t.ok(add_contact_alice_result_1.agent_id, bobby_key);
    t.ok(add_contact_alice_result_2.agent_id, alice_key);
    t.ok(remove_contact_alice_result.agent_id, bobby_key);
    t.deepEqual(empty_list_contacts.length, 0);
    t.deepEqual(list_contacts_1.length, 2);
    t.deepEqual(list_contacts_2.length, 1);
  });

  orchestrator.registerScenario("block contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    // TODO
    await setUsername("alice")(conductor, "alice");
    await setUsername("bobby")(conductor, "bobby");
    await setUsername("clark")(conductor, "clark");
    await s.consistency();

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

    let alice_key = await getAgentPubkeyFromUsername("alice")(conductor, "alice");
    let bobby_key = await getAgentPubkeyFromUsername("bobby")(conductor, "alice");
    let clark_key = await getAgentPubkeyFromUsername("clark")(conductor, "alice");

    //BLOCK A CONTACT IN CONTACTS
    await addContacts(alice_key)(conductor, "alice");
    await addContacts(bobby_key)(conductor, "alice");
    await addContacts(clark_key)(conductor, "alice");

    const list_contacts_1 = await listContacts()(conductor, "alice");
    const block_contact_result = await blockContact(bobby_key)(conductor, "alice");

    await delay(1000);

    const list_contacts_2 = await listContacts()(conductor, "alice");
    const list_blocked_1 = await listBlocked()(conductor, "alice");
    
    // BLOCK AN ALREADY BLOCKED CONTACT
    // await blockContact("bobby")(conductor, "alice");
    
    // await delay(1000);
    
    // const list_blocked_2 = await listBlocked()(conductor, "alice");

    t.deepEqual(block_contact_result.agent_id, bobby_key);
    t.deepEqual(list_contacts_1.length, 3);
    t.deepEqual(list_contacts_2.length, 2);
    t.deepEqual(list_blocked_1.length, 1);
    // t.deepEqual(list_blocked_2.length, 1)

  });

  orchestrator.registerScenario("unblock contact", async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    // TODO
    await setUsername("alice")(conductor, "alice");
    await setUsername("bobby")(conductor, "bobby");
    await setUsername("clark")(conductor, "clark");
    await delay(1000);

    let alice_key = await getAgentPubkeyFromUsername("alice")(conductor, "alice");
    let bobby_key = await getAgentPubkeyFromUsername("bobby")(conductor, "alice");
    let clark_key = await getAgentPubkeyFromUsername("clark")(conductor, "alice");

    await addContacts(alice_key)(conductor, "alice");
    await addContacts(bobby_key)(conductor, "alice");
    await addContacts(clark_key)(conductor, "alice");
    await delay(1000);

    const list_contacts_1 = await listContacts()(conductor, "alice");
    
    const block_contact_result = await blockContact(bobby_key)(conductor, "alice");
    await delay(1000);
    
    const list_blocked_1 = await listBlocked()(conductor, "alice");
    const list_contacts_2 = await listContacts()(conductor, "alice");
    
    //UNBLOCK BLOCKED CONTACT
    const unblock_contact_result = await unblockContact(bobby_key)(conductor, "alice");
    await delay(1000);
    const list_blocked_2 = await listBlocked()(conductor, "alice");
    
    t.deepEqual(block_contact_result.agent_id, bobby_key);
    t.deepEqual(unblock_contact_result.agent_id, bobby_key);
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

    await setUsername("alice")(conductor, "alice");
    await setUsername("bobby")(conductor, "bobby");
    await setUsername("clark")(conductor, "clark");
    await delay(1000);

    let alice_key = await getAgentPubkeyFromUsername("alice")(conductor, "alice");
    let bobby_key = await getAgentPubkeyFromUsername("bobby")(conductor, "alice");
    let clark_key = await getAgentPubkeyFromUsername("clark")(conductor, "alice");

    await addContacts(alice_key)(conductor, "alice");
    await addContacts(bobby_key)(conductor, "alice");
    await addContacts(clark_key)(conductor, "alice");
    await delay(1000);

    const emtpy_block_list = await listBlocked()(conductor, "alice");
    await blockContact(bobby_key)(conductor, "alice");
    await blockContact(clark_key)(conductor, "alice");
    await delay(1000);
    
    const blocked_list_1 = await listBlocked()(conductor, "alice");
    await unblockContact(bobby_key)(conductor, "alice");
    await unblockContact(clark_key)(conductor, "alice");
    await delay(1000);
    
    const blocked_list_2 = await listBlocked()(conductor, "alice");
    await blockContact(bobby_key)(conductor, "alice");
    await blockContact(clark_key)(conductor, "alice");
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

    await setUsername("alice")(conductor, "alice");
    await setUsername("bobby")(conductor, "bobby");
    await setUsername("clark")(conductor, "clark");
    await delay(1000);

    let alice_key = await getAgentPubkeyFromUsername("alice")(conductor, "alice");
    let bobby_key = await getAgentPubkeyFromUsername("bobby")(conductor, "alice");
    let clark_key = await getAgentPubkeyFromUsername("clark")(conductor, "alice");

    await addContacts(alice_key)(conductor, "alice");
    await addContacts(bobby_key)(conductor, "alice");

    await delay(1000);

    const in_contacts_1 = await inContacts(alice_key)(conductor, "alice");
    const in_contacts_2 = await inContacts(bobby_key)(conductor, "alice");
    const in_contacts_3 = await inContacts(clark_key)(conductor, "alice");

    t.deepEqual(in_contacts_1, true);
    t.deepEqual(in_contacts_2, true);
    t.deepEqual(in_contacts_3, false);
  });

  // orchestrator.registerScenario("testing", async (s, t) => {
  //   const { conductor } = await s.players({ conductor: config });
  //   await conductor.spawn();

  //   const [dna_hash, agent_address] = conductor.cellId('alice');

  //   const set_username_alice_result_1 = await conductor.call("alice", "contacts", "get_zome_id", null)
  //   console.log("this is the zome_id");
  //   console.log(set_username_alice_result_1);
  // });
};
  