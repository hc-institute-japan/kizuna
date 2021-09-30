import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { delay } from "../utils";

let orchestrator = new Orchestrator();

function createProfile(profileInput) {
  return (conductor) =>
    conductor.call("profiles", "create_profile", profileInput);
}
function sendFoo(key) {
  return (conductor) => conductor.call("bugging", "send_foo", key);
}
function getAllFoos() {
  return (conductor) => conductor.call("bugging", "get_all_foos");
}

export default (config, installables) => {
  orchestrator.registerScenario(
    "testing bugging",
    async (s: ScenarioApi, t) => {
      const [conductor] = await s.players([config]);
      const [[alice_lobby_happ], [bobby_lobby_happ]] =
        await conductor.installAgentsHapps(installables.two);
      const [alice_conductor] = alice_lobby_happ.cells;
      const [bobby_conductor] = bobby_lobby_happ.cells;

      const [dna_hash_2, agent_pubkey_bobby] = bobby_conductor.cellId;

      const foo = await sendFoo(agent_pubkey_bobby)(alice_conductor);

      delay(2000);
      console.log("this is the foo", foo);

      const foos = await getAllFoos()(bobby_conductor);

      t.deepEqual(1, foos.length);
    }
  );
  orchestrator.run();
};
