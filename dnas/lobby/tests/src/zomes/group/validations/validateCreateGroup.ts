import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { delay } from "../../../utils";
import { createGroup, runValidationRules } from "../zome_fns";

export default function validateCreateGroupTest(config, installables) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "validate_create_group method test",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(
        installables.one
      );

      // await s.shareAllNodes([alice, bobby, charlie]);
      await delay(2000);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;
      const charliePubKey = charlie_happ.agent;

      const alice_conductor = alice_happ.cells[0];

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
      delay(1000);

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
      delay(1000);

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
      delay(1000);

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
      delay(1000);

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
