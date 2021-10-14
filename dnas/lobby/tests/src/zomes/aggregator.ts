import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../install";
let orchestrator = new Orchestrator();

function createProfile(profileInput) {
  return (conductor) =>
    conductor.call("profiles", "create_profile", profileInput);
}

export default (config) => {
  orchestrator.registerScenario(
    "get latest state",
    async (s: ScenarioApi, t) => {
      const [conductor] = await s.players([config]);
      const [alice_lobby_happ] = await installAgents(conductor, ["alice"]);
      const [alice_conductor] = alice_lobby_happ.cells;

      await createProfile({
        nickname: "alice_nick",
        fields: {},
      })(alice_conductor);

      const aggreageted_result = await alice_conductor.call(
        "aggregator",
        "retrieve_latest_data",
        null
      );

      t.ok(aggreageted_result);
    }
  );
  orchestrator.run();
};
