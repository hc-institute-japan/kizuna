import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { delay } from "../../utils";
import { createGroup, init } from "./utils";

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

async function sendMessage(conductor, { group_id, sender, payload }) {
  return await conductor.call("group", "send_message", {
    group_hash: group_id,
    payload,
    sender,
  });
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

export default (orchestrator, config, installables) => {
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
          payload: { Text: { payload: "Hello" } },
          sender: alicePubKey,
        })
      );

      await delay();
      messagesFromSend.push(
        await sendMessage(alice_conductor, {
          group_id,
          payload: { Text: { payload: "How are you, Bob?!" } },
          sender: alicePubKey,
        })
      );

      await delay();

      messagesFromSend.push(
        await sendMessage(bobby_conductor, {
          group_id,
          payload: { Text: { payload: "Hi alice!" } },
          sender: bobbyPubKey,
        })
      );

      await delay();
      messagesFromSend.push(
        await sendMessage(charlie_conductor, {
          group_id,
          payload: { Text: { payload: "Yo, what's up guys?" } },
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
      await delay();

      messagesFromSend2.push(
        await sendMessage(bobby_conductor, {
          group_id: group_id2,
          payload: {
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
          payload: {
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
};
