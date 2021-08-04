import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { delay } from "../../../utils";
import { createGroup, signalHandler, indicateGroupTyping } from "../zome_fns";

export function groupTypingIndicatorTest(config, installables) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "test typing indicator for group chat",
    async (s: ScenarioApi, t) => {
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

      let bobby_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      let charlie_signal_listener = {
        counter: 0,
        payload: Buffer,
      };
      // set signal hanlders
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
      await delay(5000);

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
