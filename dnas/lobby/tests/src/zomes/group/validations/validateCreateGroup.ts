import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import { createGroup } from "../zome_fns";

export default function validateCreateGroupTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "validate_create_group method test",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);
      const [alice_lobby_happ] = await installAgents(alice, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(bobby, ["bobby"]);
      const [charlie_lobby_happ] = await installAgents(charlie, ["charlie"]);
      s.shareAllNodes([alice, bobby, charlie]);
      const [alice_conductor] = alice_lobby_happ.cells;

      await delay(2000);

      const alicePubKey = alice_lobby_happ.agent;
      const bobbyPubKey = bobby_lobby_happ.agent;
      const charliePubKey = charlie_lobby_happ.agent;

      // signal handlers assignment
      alice.setSignalHandler((signal) => {});
      bobby.setSignalHandler((signal) => {});
      charlie.setSignalHandler((signal) => {});
      // 1 - craete a valid group

      let create_group_input = {
        name: "group",
        members: [bobbyPubKey, charliePubKey],
      };

      try {
        create_group_input.members = [bobbyPubKey];
        await createGroup(create_group_input)(alice_conductor);
        await delay(1000);
      } catch (e) {
        t.deepEqual(e, {
          type: "error",
          data: {
            type: "internal_error",
            data: "Source chain error: InvalidCommit error: groups cannot be created with less than 3 members",
          },
        });
      }

      try {
        create_group_input.members = [alicePubKey, bobbyPubKey, charliePubKey];
        await createGroup(create_group_input)(alice_conductor);
        await delay(1000);
      } catch (e) {
        t.deepEqual(e, {
          type: "error",
          data: {
            type: "internal_error",
            data: "Source chain error: InvalidCommit error: creator AgentPubKey cannot be included in the group members list",
          },
        });
      }

      try {
        create_group_input.name = "";
        await createGroup(create_group_input)(alice_conductor);
        await delay(1000);
      } catch (e) {
        t.deepEqual(e, {
          type: "error",
          data: {
            type: "internal_error",
            data: "Source chain error: InvalidCommit error: the group name must at least contain 1 character and maximun 50 characters",
          },
        });
      }

      try {
        create_group_input.name = Math.pow(10, 150).toString(2);
        await createGroup(create_group_input)(alice_conductor);
        await delay(1000);
      } catch (e) {
        t.deepEqual(e, {
          type: "error",
          data: {
            type: "internal_error",
            data: "Source chain error: InvalidCommit error: the group name must at least contain 1 character and maximun 50 characters",
          },
        });
      }
    }
  );

  orchestrator.run();
}
