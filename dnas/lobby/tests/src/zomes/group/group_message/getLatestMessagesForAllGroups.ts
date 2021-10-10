import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { delay } from "../../../utils";
import {
  createGroup,
  getLatestMessagesForAllGroups,
  sendMessage,
} from "../zome_fns";

export function getLatestMessagesForAllGroupsTest(config, installables) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "get_latest_messages_for_all_groups test",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(
        installables.one
      );

      // await s.shareAllNodes([alice, bobby, charlie]);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;
      const charliePubKey = charlie_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];

      let messages_hashes: any = [];

      await delay(2000);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let create_group_input_2 = {
        name: "Group_name_2",
        members: [alicePubKey, charliePubKey],
      };

      let group_1 = await createGroup(create_group_input)(alice_conductor);
      await delay(1000);

      let group_2 = await createGroup(create_group_input_2)(alice_conductor);
      await delay(1000);

      // we send one message per group created and we'll see if the app its doing what we expect it to do

      await sendMessage(alice_conductor, {
        groupId: group_1.groupId,
        payloadInput: {
          type: "TEXT",
          payload: {
            payload: "How are you, Bob?!",
          },
        },
        sender: alicePubKey,
      });

      await delay(1000);

      await sendMessage(bobby_conductor, {
        groupId: group_2.groupId,
        payloadInput: {
          type: "TEXT",
          payload: {
            payload: "Hi alice!",
          },
        },
        sender: bobbyPubKey,
      });

      await delay(1000);

      // then we get the latest messages for all the groups

      let output = await getLatestMessagesForAllGroups(1)(alice_conductor);

      await delay(1000);

      messages_hashes = Object.values(output.groupMessagesContents);

      console.log("here are the message hashes", messages_hashes);
      console.log("here are the message hashes", output);

      t.deepEqual(messages_hashes.length, 2);
    }
  );

  orchestrator.run();
}
