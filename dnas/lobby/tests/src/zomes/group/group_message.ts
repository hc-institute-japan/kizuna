import { ScenarioApi } from "@holochain/tryorama/lib/api";
import {
  indicateGroupTyping,
  readGroupMessage,
  createGroup,
  signalHandler,
  init,
} from "./zome_fns";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export function groupTypingIndicatorTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "test typing indicator for group chat",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(
        installables.one
      );

      await s.shareAllNodes([alice, bobby, charlie]);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;
      const charliePubKey = charlie_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];
      const charlie_conductor = charlie_happ.cells[0];

      let bobby_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      let charlie_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      // SIGNAL HANLDERS ASSIGNMENT
      bobby.setSignalHandler((signal) => {
        signalHandler(signal, bobby_signal_listener)("bobby");
      });
      charlie.setSignalHandler((signal) => {
        signalHandler(signal, charlie_signal_listener)("charlie");
      });

      init(alice_conductor);
      init(bobby_conductor);
      init(charlie_conductor);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { content, group_id, group_revision_id } = await createGroup(
        create_group_input
      )(alice_conductor);
      await delay(1000);

      let group_typing_detail_data = {
        group_id,
        indicated_by: alicePubKey,
        members: [bobbyPubKey, charliePubKey],
        is_typing: true,
      };
      await indicateGroupTyping(group_typing_detail_data)(alice_conductor);
      await delay(1000);

      // check whether bobby and charlie both received the signal and that the payload is correct
      // the counter is 2 since createGroup and indicateGroupTyping both calls remote_signal()
      t.equal(bobby_signal_listener.counter, 2);
      t.equal(charlie_signal_listener.counter, 2);
      t.deepEqual(bobby_signal_listener.payload, {
        GroupTypingDetail: group_typing_detail_data,
      });
      t.deepEqual(charlie_signal_listener.payload, {
        GroupTypingDetail: group_typing_detail_data,
      });
    }
  );
}

export function readGroupMessageTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "test read message for group chat",
    async (s, t) => {
      // TODO: tests
    }
  );
}
