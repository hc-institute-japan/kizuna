import { Orchestrator } from "@holochain/tryorama";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const request = (orchestrator: Orchestrator<unknown>, config: any) => {
  orchestrator.registerScenario('Request Testing', async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const [_aliceHash, _alicePubKey] = conductor.cellId('alice');
    const [_bobbyHash, bobbyPubKey] = conductor.cellId('bobby');

    // 
    await conductor.call('alice', "request", "init", null);
    await conductor.call('bobby', "request", "init", null);


    const send = await conductor.call('alice', 'request', 'send_request_to_chat', bobbyPubKey)
    console.log("sent request by alice");
    console.log(send);
    
    const a_claims = await conductor.call('alice', 'request','get_cap_claims', null)
    console.log("alice claims");
    console.log(a_claims);
    
    const result = await conductor.call('alice', 'request', 'try_cap_claim', [a_claims[0].secret, bobbyPubKey])
    console.log("try cap claim result");
    console.log(result);
    t.deepEqual(result.code, "test");
    t.deepEqual(result.message, "working");
    t.deepEqual(result, {
      code: "test", 
      message: "working"}
    );
  })
}

export default request
