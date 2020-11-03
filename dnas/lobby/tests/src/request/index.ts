import {
  setUsername,
  getAgentPubkeyFromUsername,
  addContacts
} from '../functions';
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default (orchestrator, config) => {
  orchestrator.registerScenario('Request Testing', async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const [_aliceHash, alicePubKey] = conductor.cellId('alice');
    const [_bobbyHash, bobbyPubKey] = conductor.cellId('bobby');

    // set usernames
    await setUsername("alice")(conductor, "alice");
    await setUsername("bobby")(conductor, "bobby");
    await delay(1000);
    let alice_key = await getAgentPubkeyFromUsername("alice")(conductor, "bobby");
    let bobby_key = await getAgentPubkeyFromUsername("bobby")(conductor, "alice");
    await addContacts(bobby_key)(conductor, "alice");
    await addContacts(alice_key)(conductor, "bobby");
    await delay(1000);

    await conductor.call('alice', "request", "init", null);
    await conductor.call('bobby', "request", "init", null);

    const send = await conductor.call('alice', 'request', 'send_request_to_chat', bobbyPubKey)
    console.log("sent request by alice");
    console.log(send);
    
  //   const a_claims = await conductor.call('alice', 'request','get_cap_claims', null)
  //   console.log("alice claims");
  //   console.log(a_claims);
    
  //   const result_alice = await conductor.call('alice', 'request', 'try_cap_claim', [a_claims[0].secret, a_claims[0].grantor])
  //   console.log("try cap claim alice result");
  //   console.log(result_alice);

  //   const b_claims = await conductor.call('bobby', 'request','get_cap_claims', null)
  //   console.log("bobby claims");
  //   console.log(b_claims);

  //   const result_bobby = await conductor.call('bobby', 'request', 'try_cap_claim', [b_claims[0].secret, b_claims[0].grantor])
  //   console.log("try cap claim bobby result");
  //   console.log(result_alice);


  //   t.deepEqual(result_alice.code, "test");
  //   t.deepEqual(result_alice.message, "working");
  //   t.deepEqual(result_alice, {
  //     code: "test", 
  //     message: "working"}
  //   );

  //   t.deepEqual(result_bobby.code, "test");
  //   t.deepEqual(result_bobby.message, "working");
  //   t.deepEqual(result_bobby, {
  //     code: "test", 
  //     message: "working"}
  //   );
  })
};
