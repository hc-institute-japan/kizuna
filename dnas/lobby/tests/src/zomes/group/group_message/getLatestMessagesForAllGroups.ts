import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import {
  createGroup,
  getLatestMessagesForAllGroups,
  sendMessage,
} from "../zome_fns";

export function getLatestMessagesForAllGroupsTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "get_latest_messages_for_all_groups test",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);
      const [alice_lobby_happ] = await installAgents(alice, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(bobby, ["bobby"]);
      const [charlie_lobby_happ] = await installAgents(charlie, ["charlie"]);
      s.shareAllNodes([alice, bobby, charlie]);
      const [alice_conductor] = alice_lobby_happ.cells;
      const [bobby_conductor] = bobby_lobby_happ.cells;

      const alicePubKey = alice_lobby_happ.agent;
      const bobbyPubKey = bobby_lobby_happ.agent;
      const charliePubKey = charlie_lobby_happ.agent;

      let messages_hashes: any = [];

      await delay(2000);

      // signal handlers assignment
      alice.setSignalHandler((signal) => {});
      bobby.setSignalHandler((signal) => {});
      charlie.setSignalHandler((signal) => {});

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let create_group_input_2 = {
        name: "Group_name_2",
        members: [bobbyPubKey, charliePubKey],
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

      t.deepEqual(messages_hashes.length, 2);
    }
  );

  orchestrator.run();
}
