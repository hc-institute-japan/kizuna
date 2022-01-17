import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import {
  createGroup,
  readGroupMessage,
  sendMessage,
  signalHandler,
} from "../zome_fns";

export function readGroupMessageTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "test read group message",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);
      const [alice_lobby_happ] = await installAgents(alice, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(bobby, ["bobby"]);
      const [charlie_lobby_happ] = await installAgents(charlie, ["charlie"]);
      s.shareAllNodes([alice, bobby, charlie]);
      const [alice_conductor] = alice_lobby_happ.cells;
      const [bobby_conductor] = bobby_lobby_happ.cells;
      const [charlie_conductor] = charlie_lobby_happ.cells;

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

      await delay();

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { content, groupId, group_revision_id } = await createGroup(
        create_group_input
      )(alice_conductor);

      await delay();

      let { id: message_id_1, content: alice_message_content } =
        await sendMessage(alice_conductor, {
          groupId,
          payloadInput: {
            type: "TEXT",
            payload: { payload: "How are you, Bob?!" },
          },
          sender: alicePubKey,
        });

      await delay();

      let { id: message_id_2, content: bobby_meesage_content } =
        await sendMessage(bobby_conductor, {
          groupId,
          payloadInput: { type: "TEXT", payload: { payload: "Hi alice!" } },
          sender: bobbyPubKey,
        });

      await delay();

      let { id: message_id_3, content: charlie_message_content } =
        await sendMessage(charlie_conductor, {
          groupId,
          payloadInput: {
            type: "TEXT",
            payload: { payload: "Yo, what's up guys?" },
          },
          sender: charliePubKey,
        });

      await delay();

      let alice_group_message_read_data = {
        groupId,
        messageIds: [message_id_2, message_id_3],
        reader: alicePubKey,
        timestamp: charlie_message_content.created,
        members: [bobbyPubKey, charliePubKey],
      };

      let alice_group_message_read_data_res = await readGroupMessage(
        alice_group_message_read_data
      )(alice_conductor);

      await delay();

      let bobby_group_message_read_data = {
        groupId,
        messageIds: [message_id_1, message_id_3],
        reader: bobbyPubKey,
        timestamp: charlie_message_content.created,
        members: [alicePubKey, charliePubKey],
      };

      let bobby_group_message_read_data_res = await readGroupMessage(
        bobby_group_message_read_data
      )(bobby_conductor);
      await delay();

      let charlie_group_message_read_data = {
        groupId,
        messageIds: [message_id_1, message_id_2],
        reader: charliePubKey,
        timestamp: charlie_message_content.created,
        members: [alicePubKey, bobbyPubKey],
      };

      let charlie_group_message_read_data_res = await readGroupMessage(
        charlie_group_message_read_data
      )(charlie_conductor);
      await delay(5000);

      t.deepEqual(
        alice_group_message_read_data,
        alice_group_message_read_data_res
      );
      t.deepEqual(
        bobby_group_message_read_data,
        bobby_group_message_read_data_res
      );
      t.deepEqual(
        charlie_group_message_read_data,
        charlie_group_message_read_data_res
      );

      t.equal(alice_signal_listener.counter, 4);
      t.equal(bobby_signal_listener.counter, 5);
      t.equal(charlie_signal_listener.counter, 5);
      t.deepEqual(alice_signal_listener.payload, {
        type: "GROUP_MESSAGE_READ",
        payload: charlie_group_message_read_data,
      });
      t.deepEqual(bobby_signal_listener.payload, {
        type: "GROUP_MESSAGE_READ",
        payload: charlie_group_message_read_data,
      });
      t.deepEqual(charlie_signal_listener.payload, {
        type: "GROUP_MESSAGE_READ",
        payload: bobby_group_message_read_data,
      });
    }
  );

  orchestrator.run();
}
