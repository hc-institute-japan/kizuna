import { createNoSubstitutionTemplateLiteral } from "typescript";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    
function setUsername(username) {
  return (conductor, caller) => conductor.call(caller, "username", "set_username", username);
}

function getAgentPubkeyFromUsername(username) {
  return (conductor, caller) => conductor.call(caller, "username", "get_agent_pubkey_from_username", username)
}

function addContacts(username) {
  return (conductor, caller) =>
    conductor.call(caller, "contacts", "add_contact", username);
};

function blockContact(username) {
  return (conductor, caller) =>
    conductor.call(caller, "contacts", "block_contact", username);
};
  
function send_message_async(message_input) {
    return (conductor, caller) => conductor.call(caller, "p2pmessageasync", "send_message_async", message_input)
};

function fetch_outbox() {
  return (conductor, caller) => conductor.call(caller, "p2pmessageasync", "fetch_outbox", null)
};

function fetch_inbox() {
  return (conductor, caller) => conductor.call(caller, "p2pmessageasync", "fetch_inbox", null)
};

export default (orchestrator, config) => {
  orchestrator.registerScenario('Request Testing', async (s, t) => {
    /*
      * setup conductor
      */
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const [_aliceHash, alicePubKey] = conductor.cellId('alice');
    const [_bobbyHash, bobbyPubKey] = conductor.cellId('bobby');
    const [_clarkHash, clarkPubKey] = conductor.cellId('clark');

    console.log("alice pubkey");
    console.log(alicePubKey);
    console.log("bobby pubkey");
    console.log(bobbyPubKey);
    console.log("clark pubkey");
    console.log(clarkPubKey);

    /*
      * set usernames
      */
    await setUsername("alice")(conductor, "alice");
    await setUsername("bobby")(conductor, "bobby");
    await setUsername("clark")(conductor, "clark");
    await delay(1000);
    let alice_key = await getAgentPubkeyFromUsername("alice")(conductor, "bobby");
    let bobby_key = await getAgentPubkeyFromUsername("bobby")(conductor, "alice");
    let clark_key = await getAgentPubkeyFromUsername("clark")(conductor, "clark");
    
    /*
      * add contacts
      */
    await addContacts("bobby")(conductor, "alice");
    await addContacts("alice")(conductor, "bobby");
    await addContacts("alice")(conductor, "clark");
    await delay(1000);
      
    /*
      * message sending
      */
    const message = {
      receiver: bobbyPubKey,
      payload: "Hello world"
    };

    const message_2 = {
        receiver: alicePubKey,
        payload: "Hello back",
    }

    const message_3 = {
        receiver: clarkPubKey,
        payload: "Hello alice",
    }
  
    // alice sends a message to bob (bob is online)

    // alice gets messages

    // integrate messages and inbox messages

    const send_alice = await send_message_async(message)(conductor, 'alice');
    await delay(1000);
    console.log("alice sends a message to bob");
    console.log(send_alice);
    t.deepEqual(send_alice.author, alicePubKey);
    t.deepEqual(send_alice.receiver, bobbyPubKey);
    t.deepEqual(send_alice.payload, "Hello world");

    const alice_inbox = await fetch_inbox()(conductor, 'alice');
    await delay(1000);
    console.log("sender's inbox (should be empty)");
    console.log(alice_inbox);
    t.deepEqual(alice_inbox.length, 0);

    const alice_outbox = await fetch_outbox()(conductor, 'alice');
    await delay(1000);
    console.log("sender's outbox (should contain Alice's message)");
    console.log(alice_outbox);
    t.deepEqual(alice_outbox.length, 1);

    const bobby_inbox = await fetch_inbox()(conductor, 'bobby');
    await delay(1000);
    console.log("receiver's inbox (should contain Alice's message)");
    console.log(bobby_inbox);
    t.deepEqual(bobby_inbox.length, 1);

    const bobby_outbox = await fetch_outbox()(conductor, 'bobby');
    await delay(1000);
    console.log("receiver's outbox (should be empty)");
    console.log(bobby_outbox);
    t.deepEqual(bobby_outbox.length, 0);

    const alice_outbox_2 = await fetch_outbox()(conductor, 'alice');
    await delay(1000);
    console.log("sender's updated outbox (should contain Alice's updated message)");
    console.log(alice_outbox_2);

    // clark sends alice a message
    const send_clark = await send_message_async(message_2)(conductor, 'clark');
    await delay(1000);

    // alice gets her inbox
    const alice_inbox_2 = await fetch_inbox()(conductor, 'alice');
    await delay(1000);
    console.log("alice's inbox");
    console.log(alice_inbox_2);
    t.deepEqual(alice_inbox_2.length, 1);

    // alice blocks clark
    await blockContact('clark')(conductor, 'alice');
    await delay(1000);

    // alice gets her inbox again
    const alice_inbox_2a = await fetch_inbox()(conductor, 'alice');
    await delay(1000);
    console.log("alice's inbox after blocking clark");
    console.log(alice_inbox_2a);
    t.deepEqual(alice_inbox_2a.length, 0);


    // bob gets inbox
    const bob_inbox_2 = await fetch_inbox()(conductor, 'bobby');
    await delay(1000);
    console.log("sender's inbox (should be empty now after blocking)");
    console.log(bob_inbox_2);


    // alice gets all messages

    // alice sends a message to bob (bob is offline)

    // bob gets all messages

    // // clark sends a message to alice
    // // ERROR: You cannot send a message to a contact who has blocked you.
    // const send_to_blocker = await send_message_async(message_2)(conductor, 'clark');
    // await delay(1000);

    // // alice sends a messge to clark
    // // ERROR: You cannot send a message to a contact you have blocked.
    // const send_to_blocked = await send_message_async(message_3)(conductor, 'alice');
    // await delay(1000);
  })
};