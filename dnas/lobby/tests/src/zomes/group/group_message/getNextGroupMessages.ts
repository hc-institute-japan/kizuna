import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { delay } from "../../../utils";
import {
  createGroup,
  sendMessage,
  pinMessage,
  unpinMessage,
  getPinnnedMessages,
} from "../zome_fns";

export function getNextGroupMessages(config, installables) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "get earlier set of group messages",
    async (s: ScenarioApi, t) => {
      /*
      zome fns being tested
      pin_message, unpin_message, get_pinned_messages
    */
      const [alice, bobby, charlie] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(
        installables.one
      );

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;
      const charliePubKey = charlie_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];

      await delay(2000);

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

      pinned_messages = await getPinnnedMessages(groupId)(alice_conductor);
      t.deepEqual(Object.keys(pinned_messages).length, 0);
    }
  );
  orchestrator.run();
}
