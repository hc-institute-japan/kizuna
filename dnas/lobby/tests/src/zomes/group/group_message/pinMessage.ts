import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import {
  createGroup,
  getPinnnedMessages,
  pinMessage,
  sendMessage,
  unpinMessage,
} from "../zome_fns";

export function pinMessageTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "pin/unpin a message and then get",
    async (s: ScenarioApi, t) => {
      /*
        zome fns being tested
        pin_message, unpin_message, get_pinned_messages
      */
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

      await delay(2000);

      // signal handlers assignment
      alice.setSignalHandler((signal) => {});
      bobby.setSignalHandler((signal) => {});
      charlie.setSignalHandler((signal) => {});

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { groupId } = await createGroup(create_group_input)(alice_conductor);
      await delay();

      let { id, content } = await sendMessage(alice_conductor, {
        groupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: "Hello!" },
        },
        sender: alicePubKey,
      });
      await delay();

      await pinMessage(groupId, id)(bobby_conductor);

      await delay();

      let pinned_messages = await getPinnnedMessages(groupId)(alice_conductor);
      t.deepEqual(Object.keys(pinned_messages).length, 1);

      await unpinMessage(groupId, id)(bobby_conductor);
      await delay();

      pinned_messages = await getPinnnedMessages(groupId)(alice_conductor);
      t.deepEqual(Object.keys(pinned_messages).length, 0);

      await pinMessage(groupId, id)(alice_conductor);

      pinned_messages = await getPinnnedMessages(groupId)(alice_conductor);
      t.deepEqual(Object.keys(pinned_messages).length, 1);
    }
  );
  orchestrator.run();
}
