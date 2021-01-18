import { remove } from "lodash";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function addContact(username) {
    return (conductor) =>
      conductor.call("contacts", "add_contact", username);
};
  
function removeContact(username) {
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

function listAdded() {
  return (conductor) => conductor.call("contacts", "list_added", null);
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

export default (orchestrator, config, installables) => {
  orchestrator.registerScenario("add a contact", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ]] = await conductor.installAgentsHapps(installables.two);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;

    const [dna_hash_1, agent_pubkey_alice] = alice_conductor.cellId;
    const [dna_hash_2, agent_pubkey_bobby] = bobby_conductor.cellId;

    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await delay(1000);

    // add self
    const add_self = await addContact("alice_123")(alice_conductor);

    // no contact then add
    const none_then_add = await addContact("bobby_123")(alice_conductor);

    // add then add
    const add_then_add =  await addContact("bobby_123")(alice_conductor);

    // block then add
    await blockContact("bobby_123")(alice_conductor);
    // should return None fields because you cant add blocked contacts
    const block_then_add = await addContact("bobby_123")(alice_conductor);

    // unblock then add
    await unblockContact("bobby_123")(alice_conductor);
    const unblock_then_add = await addContact("bobby_123")(alice_conductor);
    
    // remove then add
    await removeContact("bobby_123")(alice_conductor);
    const remove_then_add = await addContact("bobby_123")(alice_conductor);
    

    t.deepEqual(add_self.agent_id, agent_pubkey_alice);
    t.deepEqual(add_self.username, "alice_123");

    t.deepEqual(none_then_add.agent_id, agent_pubkey_bobby);
    t.deepEqual(none_then_add.username, "bobby_123");
    
    t.deepEqual(add_then_add.agent_id, agent_pubkey_bobby);
    t.deepEqual(add_then_add.username, "bobby_123");

    t.deepEqual(block_then_add.agent_id, null);
    t.deepEqual(block_then_add.username, null);

    t.deepEqual(unblock_then_add.agent_id, agent_pubkey_bobby);
    t.deepEqual(unblock_then_add.username, "bobby_123");

    t.deepEqual(remove_then_add.agent_id, agent_pubkey_bobby);
    t.deepEqual(remove_then_add.username, "bobby_123");
  });

  orchestrator.registerScenario("remove a contact", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ]] = await conductor.installAgentsHapps(installables.two);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;

    const [dna_hash_2, agent_pubkey_bobby] = bobby_conductor.cellId;
    
    await setUsername("bobby_123")(bobby_conductor);
    await delay(1000);

    // no contact then remove
    const none_then_remove = await removeContact("bobby_123")(alice_conductor);

    // add then remove
    await addContact("bobby_123")(alice_conductor);
    const add_then_remove = await removeContact("bobby_123")(alice_conductor);
  
    // remove then remove
    const remove_then_remove = await removeContact("bobby_123")(alice_conductor);
    
    // block then remove
    await blockContact("bobby_123")(alice_conductor);
    const block_then_remove = await removeContact("bobby_123")(alice_conductor);

    // unblock then remove
    await unblockContact("bobby_123")(alice_conductor);
    const unblock_then_remove = await removeContact("bobby_123")(alice_conductor);

    t.deepEqual(none_then_remove.agent_id, agent_pubkey_bobby);
    t.deepEqual(none_then_remove.username, "bobby_123");

    t.deepEqual(add_then_remove.agent_id, agent_pubkey_bobby);
    t.deepEqual(add_then_remove.username, "bobby_123");

    t.deepEqual(remove_then_remove.agent_id, agent_pubkey_bobby);
    t.deepEqual(remove_then_remove.username, "bobby_123");

    // only time null is if the latest contact_type is Block.
    t.deepEqual(block_then_remove.agent_id, null);
    t.deepEqual(block_then_remove.username, null);

    t.deepEqual(unblock_then_remove.agent_id, agent_pubkey_bobby);
    t.deepEqual(unblock_then_remove.username, "bobby_123");
  });

  orchestrator.registerScenario("list added", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ], [clark_lobby_happ]] = await conductor.installAgentsHapps(installables.three);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;
    const [clark_conductor] = clark_lobby_happ.cells;

    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await setUsername("clark_123")(clark_conductor);
    await delay(1000);

    const empty_list_added = await listAdded()(alice_conductor);
    await addContact("alice_123")(alice_conductor);
    await addContact("bobby_123")(alice_conductor);
    await addContact("clark_123")(alice_conductor);
    
    const list_added_1 = await listAdded()(alice_conductor);
    await removeContact("bobby_123")(alice_conductor);
    
    const list_added_2 = await listAdded()(alice_conductor);
    await blockContact("clark_123")(alice_conductor);
    
    const list_added_3 = await listAdded()(alice_conductor);
    await addContact("bobby_123")(alice_conductor);

    const list_added_4 = await listAdded()(alice_conductor);
    await removeContact("bobby_123")(alice_conductor);
    
    const list_added_5 = await listAdded()(alice_conductor);

    t.deepEqual(empty_list_added.length, 0);
    t.deepEqual(list_added_1.length, 3);
    t.deepEqual(list_added_2.length, 2);
    t.deepEqual(list_added_3.length, 1);
    t.deepEqual(list_added_4.length, 2);
    t.deepEqual(list_added_5.length, 1);
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

    // block myself
    const block_myself_result = await blockContact("alice_123")(alice_conductor);

    // no contact then block
    const none_then_block = await blockContact("clark_123")(alice_conductor);
    await delay(1000);

    // added then block
    await addContact("bobby_123")(alice_conductor);
    const added_then_block = await blockContact("bobby_123")(alice_conductor);
    
    // blocked then block
    const blocked_then_block = await blockContact("bobby_123")(alice_conductor);
    
    // unblocked then block
    await unblockContact("bobby_123")(alice_conductor);
    const unblocked_then_block = await blockContact("bobby_123")(alice_conductor);

    // removed then block
    await unblockContact("bobby_123")(alice_conductor);
    await addContact("bobby_123")(alice_conductor);
    await removeContact("bobby_123")(alice_conductor);
    const removed_then_block = await blockContact("bobby_123")(alice_conductor);


    t.deepEqual(block_myself_result.agent_id, null);
    t.deepEqual(block_myself_result.username, null);

    t.deepEqual(none_then_block.agent_id, agent_pubkey_clark);
    t.deepEqual(none_then_block.username, "clark_123");

    t.deepEqual(added_then_block.agent_id, agent_pubkey_bobby);
    t.deepEqual(added_then_block.username, "bobby_123");
    
    t.deepEqual(blocked_then_block.agent_id, agent_pubkey_bobby);
    t.deepEqual(blocked_then_block.username, "bobby_123");

    t.deepEqual(unblocked_then_block.agent_id, agent_pubkey_bobby);
    t.deepEqual(unblocked_then_block.username, "bobby_123");
    
    t.deepEqual(removed_then_block.agent_id, agent_pubkey_bobby);
    t.deepEqual(removed_then_block.username, "bobby_123");
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

    // no contact then unblock
    const none_then_unblock = await unblockContact("bobby_123")(alice_conductor);

    await addContact("alice_123")(alice_conductor);
    await addContact("bobby_123")(alice_conductor);
    await addContact("clark_123")(alice_conductor);
    
    // added then unblock
    const added_then_unblock = await unblockContact("bobby_123")(alice_conductor);
    
    // removed then unblock
    await removeContact("bobby_123")(alice_conductor);
    const removed_then_unblock = await unblockContact("bobby_123")(alice_conductor);
    
    // blocked then unblock
    await blockContact("bobby_123")(alice_conductor);
    const blocked_then_unblock = await unblockContact("bobby_123")(alice_conductor);

    // unblocked then unblock
    const unblocked_then_unblock = await unblockContact("bobby_123")(alice_conductor);
    
    t.deepEqual(none_then_unblock.agent_id, agent_pubkey_bobby);
    t.deepEqual(none_then_unblock.username, "bobby_123");
    
    // return null when contact is added
    t.deepEqual(added_then_unblock.agent_id, null);
    t.deepEqual(added_then_unblock.username, null);

    t.deepEqual(removed_then_unblock.agent_id, agent_pubkey_bobby);
    t.deepEqual(removed_then_unblock.username, "bobby_123");

    t.deepEqual(blocked_then_unblock.agent_id, agent_pubkey_bobby);
    t.deepEqual(blocked_then_unblock.username, "bobby_123");

    t.deepEqual(unblocked_then_unblock.agent_id, agent_pubkey_bobby);
    t.deepEqual(unblocked_then_unblock.username, "bobby_123");
  });

  orchestrator.registerScenario("list blocked", async (s, t) => {
    const [conductor] = await s.players([config]);
    const [[alice_lobby_happ], [bobby_lobby_happ], [clark_lobby_happ]] = await conductor.installAgentsHapps(installables.three);
    const [alice_conductor] = alice_lobby_happ.cells;
    const [bobby_conductor] = bobby_lobby_happ.cells;
    const [clark_conductor] = clark_lobby_happ.cells;

    await setUsername("alice_123")(alice_conductor);
    await setUsername("bobby_123")(bobby_conductor);
    await setUsername("clark_123")(clark_conductor);
    await delay(1000);

    const empty_list_blocked = await listBlocked()(alice_conductor);
    await blockContact("bobby_123")(alice_conductor);
    await blockContact("clark_123")(alice_conductor);
    
    const list_blocked_1 = await listBlocked()(alice_conductor);
    await unblockContact("bobby_123")(alice_conductor);
    
    const list_blocked_2 = await listBlocked()(alice_conductor);
    await unblockContact("clark_123")(alice_conductor);
    
    const list_blocked_3 = await listBlocked()(alice_conductor);
    await blockContact("bobby_123")(alice_conductor);

    const list_blocked_4 = await listBlocked()(alice_conductor);
    await blockContact("clark_123")(alice_conductor);
    
    const list_blocked_5 = await listBlocked()(alice_conductor);

    t.deepEqual(empty_list_blocked.length, 0);
    t.deepEqual(list_blocked_1.length, 2);
    t.deepEqual(list_blocked_2.length, 1);
    t.deepEqual(list_blocked_3.length, 0);
    t.deepEqual(list_blocked_4.length, 1);
    t.deepEqual(list_blocked_5.length, 2);
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
  