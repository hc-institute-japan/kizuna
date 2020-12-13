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
    const message_1 = {
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
  
    // CASES
    /*
     * ALICE SENDS A MESSAGE TO BOBBY
     * BOBBY IS OFFLINE WHEN MESSAGE WAS SENT
     * BOBBY RETURNS ONLINE AND INFORMS ALICE THAT HE RECEIVED THE MESSAGE
     * ALICE IS ONLINE WHEN BOBBY INFORMS HER
     */

    const bobby_inbox_prior_send = await fetch_inbox()(conductor, 'bobby');
    await delay(1000);
    console.log("receiver's inbox (should be empty)");
    console.log(bobby_inbox_prior_send);
    t.deepEqual(bobby_inbox_prior_send.length, 0);

    const send_alice = await send_message_async(message_1)(conductor, 'alice');
    await delay(1000);
    console.log("alice sends a message to bobby");
    console.log(send_alice);
    t.deepEqual(send_alice.author, alicePubKey);
    t.deepEqual(send_alice.receiver, bobbyPubKey);
    t.deepEqual(send_alice.payload, "Hello world");

    const bobby_inbox_after_send = await fetch_inbox()(conductor, 'bobby');
    await delay(1000);
    console.log("receiver's inbox (should contain Alice's message)");
    console.log(bobby_inbox_after_send);
    t.deepEqual(bobby_inbox_after_send.length, 1);

    /*
     * ALICE SENDS A MESSAGE TO BOBBY
     * BOBBY IS OFFLINE WHEN MESSAGE WAS SENT
     * BOBBY RETURNS ONLINE AND INFORMS ALICE THAT HE RECEIVED THE MESSAGE
     * ALICE IS OFFLINE WHEN BOBBY INFORMS HER
     */

    

    /*
     * ALICE SENDS A MESSAGE TO BOBBY
     * BOBBY IS OFFLINE WHEN MESSAGE WAS SENT
     * BOBBY DOES NOT RETURN ONLINE
     */


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