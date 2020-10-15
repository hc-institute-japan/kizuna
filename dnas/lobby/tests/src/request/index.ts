import { Orchestrator } from "@holochain/tryorama";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const request = (orchestrator: Orchestrator<unknown>, config: any) => {
  orchestrator.registerScenario('Request Testing', async (s, t) => {
    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();
    const [alice_hash, alice_pubkey] = conductor.cellId('alice');
    const [bobby_hash, bobby_pubkey] = conductor.cellId('bobby');
    await conductor.call('alice', "request", "init", null);
    await conductor.call('bobby', "request", "init", null);

    await conductor.call('alice', "request", "send_request", bobby_pubkey);
    // const result = await conductor.call('alice', "request", "get_cap_claims", null) 
    // console.log('Results: ')

    // console.log(result);

    // console.log("End Results: ")

    // const test = await conductor.call('bobby', "request", "is_updating", null)  
    // console.log(test)
    
  })
}

export default request
