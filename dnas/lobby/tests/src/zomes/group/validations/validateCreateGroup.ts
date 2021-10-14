import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import { createGroup, runValidationRules } from "../zome_fns";

export default function validateCreateGroupTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "validate_create_group method test",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);
      const [alice_lobby_happ] = await installAgents(alice, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(bobby, ["bobby"]);
      const [charlie_lobby_happ] = await installAgents(charlie, ["charlie"]);
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
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let create_group_output = await createGroup(create_group_input)(
        alice_conductor
      );
      await delay(1000);

      let validation_input = {
        validationType: "create",
        groupRevisionId: create_group_output.groupRevisionId,
      };
      // 2 - check the validation rules output ancd check if we get the expected value

      let validation_output = await runValidationRules(validation_input)(
        alice_conductor
      );
      await delay(1000);

      t.deepEqual(
        validation_output,
        {
          Valid: null,
        },
        "this group pass the validation rules and can be committed and shared through the network"
      );

      // 3 - create a group with invalid group members field (groups cannot be created with less than 2 members apart of you)

      create_group_input.members = [bobbyPubKey];

      create_group_output = await createGroup(create_group_input)(
        alice_conductor
      );
      await delay(1000);

      validation_input.groupRevisionId = create_group_output.groupRevisionId;

      // 4 - check the validation rules output and check if we get the expected value

      validation_output = await runValidationRules(validation_input)(
        alice_conductor
      );
      await delay(1000);

      t.deepEqual(
        validation_output,
        { Invalid: "groups cannot be created with less than 3 members" },
        "groups cannot be created with less than 3 members"
      );

      // 5 - create a group with invalid group members field (creator agentpubkey cannot be included in the group members list)

      create_group_input.members = [alicePubKey, bobbyPubKey, charliePubKey];

      create_group_output = await createGroup(create_group_input)(
        alice_conductor
      );
      await delay(1000);

      validation_input.groupRevisionId = create_group_output.groupRevisionId;

      // 6 - check the validation rules output and check if we get the expected value

      validation_output = await runValidationRules(validation_input)(
        alice_conductor
      );
      await delay(1000);

      t.deepEqual(
        validation_output,
        {
          Invalid:
            "creator AgentPubKey cannot be included in the group members list",
        },
        "creator AgentPubKey cannot be included in the group members list"
      );

      // 7 - create a group with invalid group name field (the group name must at least contain 1 character and maximun 50 characters)
      create_group_input.members = [bobbyPubKey, charliePubKey];
      create_group_input.name = "";

      create_group_output = await createGroup(create_group_input)(
        alice_conductor
      );
      await delay(1000);

      validation_input.groupRevisionId = create_group_output.groupRevisionId;

      // 6 - check the validation rules output and check if we get the expected value

      validation_output = await runValidationRules(validation_input)(
        alice_conductor
      );
      await delay(1000);

      t.deepEqual(
        validation_output,
        {
          Invalid:
            "the group name must at least contain 1 character and maximun 50 characters",
        },
        "the group name must at least contain 1 character and maximun 50 characters"
      );
    }
  );

  orchestrator.run();
}
