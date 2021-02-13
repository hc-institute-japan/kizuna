import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { delay } from "../../utils";
import { createGroup, init } from "./utils";
import {
  indicateGroupTyping,
  signalHandler,
  sendMessage,
  readGroupMessage,
} from "./zome_fns";

function sendMessageSignalHandler(signal, data) {
  return function (sender) {
    if (signal.data.payload.payload.GroupMessageData) {
      const group = JSON.stringify(
        signal.data.payload.payload.GroupMessageData.content.groupHash
      );
      if (!data[group]) data[group] = {};
      const agent = JSON.stringify(sender);
      if (data[group][agent])
        data[group][agent].push(signal.data.payload.payload.GroupMessageData);
      else data[group][agent] = [signal.data.payload.payload.GroupMessageData];
    }
  };
}

function evaluateMessagesFromSignal(messagesFromSignal, messages, t) {
  Object.keys(messagesFromSignal).forEach((group) => {
    Object.keys(messagesFromSignal[group]).forEach((agent) => {
      t.deepEqual(
        messagesFromSignal[group][agent],
        messages.filter(
          (message) =>
            JSON.stringify(message.content.sender) !== agent &&
            JSON.stringify(message.content.groupHash) === group
        )
      );
      // );
    });
  });
}

function sendMessageTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "Tests for text send_message",
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
      let list = {};
      const messagesFromSend: any[] = [];

      // SIGNAL HANLDERS ASSIGNMENT
      alice.setSignalHandler((signal) => {
        sendMessageSignalHandler(signal, list)(alicePubKey);
      });
      bobby.setSignalHandler((signal) => {
        sendMessageSignalHandler(signal, list)(bobbyPubKey);
      });
      charlie.setSignalHandler((signal) => {
        sendMessageSignalHandler(signal, list)(charliePubKey);
      });

      init(alice_conductor);
      init(bobby_conductor);
      init(charlie_conductor);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { group_id } = await createGroup(create_group_input)(alice_conductor);

      await delay();

      messagesFromSend.push(
        await sendMessage(alice_conductor, {
          group_id,
          payload_input: { Text: { payload: "Hello" } },
          sender: alicePubKey,
        })
      );

      await delay();
      messagesFromSend.push(
        await sendMessage(alice_conductor, {
          group_id,
          payload_input: { Text: { payload: "How are you, Bob?!" } },
          sender: alicePubKey,
        })
      );

      await delay();

      messagesFromSend.push(
        await sendMessage(bobby_conductor, {
          group_id,
          payload_input: { Text: { payload: "Hi alice!" } },
          sender: bobbyPubKey,
        })
      );

      await delay();
      messagesFromSend.push(
        await sendMessage(charlie_conductor, {
          group_id,
          payload_input: { Text: { payload: "Yo, what's up guys?" } },
          sender: charliePubKey,
        })
      );

      await delay();

      const group1AliceMesssges = await alice_conductor.call(
        "group",
        "get_all_messages",
        group_id
      );

      await delay();

      const group1BobbyMesssges = await bobby_conductor.call(
        "group",
        "get_all_messages",
        group_id
      );

      await delay();

      const group1CharlieMesssges = await charlie_conductor.call(
        "group",
        "get_all_messages",
        group_id
      );

      await delay();

      t.deepEqual(group1AliceMesssges, group1BobbyMesssges);
      t.deepEqual(group1CharlieMesssges, group1AliceMesssges);
      t.deepEqual(messagesFromSend, group1AliceMesssges);

      const messagesFromSend2: any[] = [];
      let create_group_input2 = {
        name: "Group_name",
        members: [charliePubKey],
      };

      let { group_id: group_id2 } = await createGroup(create_group_input2)(
        bobby_conductor
      );

      await delay();

      messagesFromSend2.push(
        await sendMessage(bobby_conductor, {
          group_id: group_id2,
          payload_input: {
            Text: {
              payload: "Yo charlie, this will be the GC for the management!",
            },
          },
          sender: bobbyPubKey,
        })
      );

      await delay();

      messagesFromSend2.push(
        await sendMessage(charlie_conductor, {
          group_id: group_id2,
          payload_input: {
            Text: {
              payload: "Ayt, thanks!",
            },
          },
          sender: charliePubKey,
        })
      );

      await delay();

      const messages2 = await bobby_conductor.call(
        "group",
        "get_all_messages",
        group_id2
      );

      await delay(5000);
      await evaluateMessagesFromSignal(
        list,
        [...group1AliceMesssges, ...messages2],
        t
      );
    }
  );
}

function groupTypingIndicatorTest(orchestrator, config, installables) {
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

function readGroupMessageTest(orchestrator, config, installables) {
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
      // SIGNAL HANLDERS ASSIGNMENT
      alice.setSignalHandler((signal) => {
        signalHandler(signal, alice_signal_listener)("alice");
      });
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

      let {
        id: message_id_1,
        content: alice_message_content,
      } = await sendMessage(alice_conductor, {
        group_id,
        payload_input: { Text: { payload: "How are you, Bob?!" } },
        sender: alicePubKey,
      });

      await delay();

      let {
        id: message_id_2,
        content: bobby_meesage_content,
      } = await sendMessage(bobby_conductor, {
        group_id,
        payload_input: { Text: { payload: "Hi alice!" } },
        sender: bobbyPubKey,
      });

      await delay();

      let {
        id: message_id_3,
        content: charlie_message_content,
      } = await sendMessage(charlie_conductor, {
        group_id,
        payload_input: { Text: { payload: "Yo, what's up guys?" } },
        sender: charliePubKey,
      });

      let alice_group_message_read_data = {
        group_id,
        message_ids: [message_id_2, message_id_3],
        reader: alicePubKey,
        timestamp: charlie_message_content.created,
        members: [bobbyPubKey, charliePubKey],
      };

      let alice_group_message_read_data_res = await readGroupMessage(
        alice_group_message_read_data
      )(alice_conductor);
      await delay();

      let bobby_group_message_read_data = {
        group_id,
        message_ids: [message_id_1, message_id_3],
        reader: bobbyPubKey,
        timestamp: charlie_message_content.created,
        members: [alicePubKey, charliePubKey],
      };

      let bobby_group_message_read_data_res = await readGroupMessage(
        bobby_group_message_read_data
      )(bobby_conductor);
      await delay();

      let charlie_group_message_read_data = {
        group_id,
        message_ids: [message_id_1, message_id_2],
        reader: charliePubKey,
        timestamp: charlie_message_content.created,
        members: [alicePubKey, bobbyPubKey],
      };

      let charlie_group_message_read_data_res = await readGroupMessage(
        charlie_group_message_read_data
      )(charlie_conductor);
      await delay();

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
        GroupMessageRead: charlie_group_message_read_data,
      });
      t.deepEqual(bobby_signal_listener.payload, {
        GroupMessageRead: charlie_group_message_read_data,
      });
      t.deepEqual(charlie_signal_listener.payload, {
        GroupMessageRead: bobby_group_message_read_data,
      });
    }
  );
}

export { groupTypingIndicatorTest, sendMessageTest, readGroupMessageTest };
