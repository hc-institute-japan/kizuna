import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import { createGroup, indicateGroupTyping, signalHandler } from "../zome_fns";

export function groupTypingIndicatorTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "test typing indicator for group chat",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);
      const [alice_lobby_happ] = await installAgents(alice, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(bobby, ["bobby"]);
      const [charlie_lobby_happ] = await installAgents(charlie, ["charlie"]);
      s.shareAllNodes([alice, bobby, charlie]);
      const [alice_conductor] = alice_lobby_happ.cells;

      const alicePubKey = alice_lobby_happ.agent;
      const bobbyPubKey = bobby_lobby_happ.agent;
      const charliePubKey = charlie_lobby_happ.agent;

      let alice_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      let bobby_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      let charlie_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      // set signal hanlders
      alice.setSignalHandler((signal) => {
        signalHandler(signal, alice_signal_listener);
      });
      bobby.setSignalHandler((signal) => {
        signalHandler(signal, bobby_signal_listener);
      });
      charlie.setSignalHandler((signal) => {
        signalHandler(signal, charlie_signal_listener);
      });

      await delay(2000);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { content, groupId, group_revision_id } = await createGroup(
        create_group_input
      )(alice_conductor);
      await delay(1000);

      let group_typing_detail_data = {
        groupId,
        indicatedBy: alicePubKey,
        members: [bobbyPubKey, charliePubKey],
        isTyping: true,
      };
      await indicateGroupTyping(group_typing_detail_data)(alice_conductor);
      await delay();

      // check whether bobby and charlie both received the signal and that the payload is correct
      // the counter is 2 since createGroup and indicateGroupTyping both calls remote_signal()
      t.equal(bobby_signal_listener.counter, 2);
      t.equal(charlie_signal_listener.counter, 2);

      t.deepEqual(bobby_signal_listener.payload, {
        type: "GROUP_TYPING_DETAIL",
        payload: group_typing_detail_data,
      });
      t.deepEqual(charlie_signal_listener.payload, {
        type: "GROUP_TYPING_DETAIL",
        payload: group_typing_detail_data,
      });
    }
  );

  orchestrator.run();
}
