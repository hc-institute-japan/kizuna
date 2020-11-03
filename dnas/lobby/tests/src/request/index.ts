import {
  setUsername,
  getAgentPubkeyFromUsername,
  addContacts,
  send_message,
  receive_message,
  get_all_messages,
  get_all_messages_from_addresses,
  get_batch_messages_on_conversation
} from '../functions';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default (orchestrator, config) => {
  orchestrator.registerScenario('Request Testing', async (s, t) => {
    /*
     * setup conductor
     */
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const [_aliceHash, alicePubKey] = conductor.cellId('alice');
    const [_bobbyHash, bobbyPubKey] = conductor.cellId('bobby');

    /*
     * set usernames
     */
    await setUsername("alice")(conductor, "alice");
    await setUsername("bobby")(conductor, "bobby");
    await delay(1000);
    let alice_key = await getAgentPubkeyFromUsername("alice")(conductor, "bobby");
    let bobby_key = await getAgentPubkeyFromUsername("bobby")(conductor, "alice");
    
    /*
     * add contacts
     */
    await addContacts(bobby_key)(conductor, "alice");
    await addContacts(alice_key)(conductor, "bobby");
    await delay(1000);

    /*
     * start requests process
     */
     // init
    await conductor.call('alice', "request", "init", null);
    await conductor.call('bobby', "request", "init", null);
    
    // alice sends a request to chat to bobby
    const send = await conductor.call('alice', 'request', 'send_request_to_chat', bobbyPubKey)
    console.log("sent request by alice");
    console.log(send);
    
    // alice gets her own cap claims
    const alice_claims = await conductor.call('alice', 'request','get_cap_claims', null)
    console.log("alice claims");
    console.log(alice_claims);
    
    // bobby gets his own cap claims
    const bobby_claims = await conductor.call('bobby', 'request','get_cap_claims', null)
    console.log("bobby claims");
    console.log(bobby_claims);

    // alice gets her own cap claims
    const alice_grants = await conductor.call('alice', 'request','get_cap_grants', null)
    console.log("alice grants");
    console.log(alice_grants);

    // bobby gets his own cap claims
    const bobby_grants = await conductor.call('bobby', 'request','get_cap_grants', null)
    console.log("bobby grants");
    console.log(bobby_grants);

    /*
     * message sending
     */
    const message = {
      receiver: bobbyPubKey,
      payload: "Hello world",
      secret: alice_claims[0].secret
    };

    const message_2 = {
        receiver: alicePubKey,
        payload: "Hello back",
    }

    const message_3 = {
        receiver: alicePubKey,
        payload: "Hello alice",
    }
  
    // alice sends a message to bob
    const send_alice = await send_message(message)(conductor, 'alice');
    await delay(1000);
    console.log("alice sends a message to bob");
    console.log(send_alice);
    t.deepEqual(send_alice.author, alicePubKey);
    t.deepEqual(send_alice.receiver, bobbyPubKey);
    t.deepEqual(send_alice.payload, "Hello world");

    // // alice sends another message to bob
    // const send_alice_2 = await send_message(message)(conductor, 'alice');
    // await delay(1000);
    // console.log("alice sends a message to bob");
    // console.log(send_alice_2);
    // t.deepEqual(send_alice_2.author, alicePubKey);
    // t.deepEqual(send_alice_2.receiver, bobbyPubKey);
    // t.deepEqual(send_alice_2.payload, "Hello world");

    // // bob sends a message to alice
    // const send_bobby = await send_message(message_2)(conductor, 'bobby');
    // await delay(1000);
    // console.log("bob sends message to alice");
    // console.log(send_bobby);
    // t.deepEqual(send_bobby.author, bobbyPubKey);
    // t.deepEqual(send_bobby.receiver, alicePubKey);
    // t.deepEqual(send_bobby.payload, "Hello back");

  })
};
