import { Orchestrator } from "@holochain/tryorama";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const request = (orchestrator: Orchestrator<unknown>, config: any) => {
  orchestrator.registerScenario('Request Testing', async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();
    const [_aliceHash, _alicePubKey] = conductor.cellId('alice');
    const [_bobbyHash, bobbyPubKey] = conductor.cellId('bobby');
    await conductor.call('alice', "request", "init", null);
    await conductor.call('bobby', "request", "init", null);
    await conductor.call('alice', 'request', 'receive_request', bobbyPubKey)
    const b_claims = await conductor.call('bobby', 'request','get_cap_claims', null)

    const result = await conductor.call('bobby', 'request', 'send_message', {cap_secret: b_claims[0].secret, agent_pub_key: bobbyPubKey})
    t.deepEqual(result.code, "test");
    t.deepEqual(result.message, "working");
    t.deepEqual(result, {
      code: "test", 
      message: "working"}
    );
  })
}

export default request
