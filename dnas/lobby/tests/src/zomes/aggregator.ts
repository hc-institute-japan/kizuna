import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";

let orchestrator = new Orchestrator();

function createProfile(profileInput) {
  return (conductor) =>
    conductor.call("profiles", "create_profile", profileInput);
}

export default (config, installables) => {
  orchestrator.registerScenario(
    "get latest state",
    async (s: ScenarioApi, t) => {
      const [conductor] = await s.players([config]);
      const [[alice_lobby_happ], [bobby_lobby_happ]] =
        await conductor.installAgentsHapps(installables.two);
      const [alice_conductor] = alice_lobby_happ.cells;
      const [bobby_conductor] = bobby_lobby_happ.cells;

      const profile = await createProfile({
        nickname: "alice_nick",
        fields: {},
      })(alice_conductor);

      console.log("this is the profile", profile);

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
