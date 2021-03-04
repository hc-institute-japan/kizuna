import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { delay, dateToTimestamp } from "../../utils";

import * as fs from "fs";
import * as path from "path";

import {
  getNextBatchGroupMessage,
  init,
  indicateGroupTyping,
  createGroup,
  readGroupMessage,
  sendMessage,
  signalHandler,
  getLatestMessagesForAllGroups,
  sendMessageWithDate,
  strToUtf8Bytes,
  getMyGroupsList,
  getMessagesByGroupByTimestamp,
} from "./zome_fns";
import { identity } from "lodash";

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
        messagesFromSignal[group][agent].filter(
          (v, i, a) =>
            a.findIndex((t) => JSON.stringify(t) === JSON.stringify(v)) === i
        ),
        messages.filter(
          (message) =>
            JSON.stringify(message.content.sender) !== agent &&
            JSON.stringify(message.content.groupHash) === group
        )
      );
    });
  });
}

// function evaluateMessagesFromSignal(messagesFromSignal, messages, t) {}

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

function getNextBatchOfMessagesTest(orchestrator, config, installables) {
  orchestrator.registerScenario("hey", async (s: ScenarioApi, t) => {
    const [alice, bobby, charlie] = await s.players([config, config, config]);

    const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
    const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
    const [[charlie_happ]] = await charlie.installAgentsHapps(installables.one);

    await s.shareAllNodes([alice, bobby, charlie]);

    const alicePubKey = alice_happ.agent;
    const bobbyPubKey = bobby_happ.agent;
    const charliePubKey = charlie_happ.agent;

    const alice_conductor = alice_happ.cells[0];
    const bobby_conductor = bobby_happ.cells[0];
    const charlie_conductor = charlie_happ.cells[0];

    init(alice_conductor);
    init(bobby_conductor);
    init(charlie_conductor);

    let create_group_input = {
      name: "Group_name",
      members: [bobbyPubKey, charliePubKey],
    };

    let output;
    let messages_hashes: any = [];
    let messages_contents: any = [];
    let messages_read_list: any = [];
    let filter;
    let counter = 0;

    let { content, group_id, group_revision_id } = await createGroup(
      create_group_input
    )(alice_conductor);
    await delay(500);

    // 1- GET A BATCH FOR A GROUP WITHOUT MESSAGES

    filter = {
      group_id,
      last_fetched: null,
      last_message_timestamp: null,
      batch_size: 5, //THIS BATCH-SIZE CAN BE 0 BUT WE SHOULD MAYBE HANDLE THIS FROM THE BACK-END
      payload_type: { Text: null },
    };

    output = await getNextBatchGroupMessage(filter)(bobby_conductor);
    await delay(1000);

    messages_hashes = Object.values(output.messages_by_group)[0];
    messages_contents = Object.values(output.group_messages_contents);

    t.deepEqual(messages_hashes, []);
    t.deepEqual(messages_contents, []);

    // 2- GET A BATCH FOR A GROUP WITH MESSAGES (THIS TEST HAVE A BATCH SIZE BIGGER THAN THE NUMBER OF MESSAGGES FOR THIS GROUP)

    //FIRST MESSAGES SEND TO THIS GROUP (THIS MESSAGE WILL BE READED FOR 2 MEMBERS BOBBY AND CHARLIE )
    let {
      id: message_id_1,
      content: alice_message_content,
    } = await sendMessage(alice_conductor, {
      group_id,
      payload_input: { Text: { payload: "How are you, Bob?!" } },
      sender: alicePubKey,
    });

    await delay(500);

    let group_message_read_data = {
      group_id,
      message_ids: [message_id_1],
      reader: alicePubKey,
      timestamp: alice_message_content.created,
      members: [bobbyPubKey, charliePubKey],
    };

    await readGroupMessage(group_message_read_data)(alice_conductor);
    await delay();

    group_message_read_data.reader = bobbyPubKey;

    await readGroupMessage(group_message_read_data)(bobby_conductor);
    await delay();

    output = await getNextBatchGroupMessage(filter)(bobby_conductor);
    await delay(1000);

    messages_hashes = Object.values(output.messages_by_group)[0];

    Object.values(output.group_messages_contents).map(
      (message_content: any) => {
        messages_contents.push(message_content[0].signed_header.header.content);
        messages_read_list.push(message_content[1]);
      }
    );

    t.deepEqual(messages_hashes, [message_id_1]);
    t.deepEqual(messages_contents[0].author, alicePubKey);
    t.deepEqual(messages_contents[0].entry_hash, message_id_1);
    t.deepEqual(Object.values(messages_read_list[0]).length, 2);

    messages_contents = [];
    messages_read_list = [];

    // TEST GET BATCHES OF ONE MESSAGE PER CALL TEST MADE USING 3 MESSAGES

    // THE SENCOND MESSAGE WILL ONLY BE READ BY ALICE
    let {
      id: message_id_2,
      content: bobby_meesage_content,
    } = await sendMessage(bobby_conductor, {
      group_id,
      payload_input: { Text: { payload: "Hi alice!" } },
      sender: bobbyPubKey,
    });

    await delay(500);

    group_message_read_data.message_ids = [message_id_2];
    group_message_read_data.reader = alicePubKey;
    group_message_read_data.timestamp = bobby_meesage_content.created;

    await readGroupMessage(group_message_read_data)(alice_conductor);

    await delay(500);

    // THIRD MESSAGE HAVENT BEEN READ YET BY ANY MEMBER

    let {
      id: message_id_3,
      content: charlie_message_content,
    } = await sendMessage(charlie_conductor, {
      group_id,
      payload_input: { Text: { payload: "Yo, what's up guys?" } },
      sender: charliePubKey,
    });

    await delay(500);

    filter.batch_size = 1;

    output = await getNextBatchGroupMessage(filter)(bobby_conductor);
    await delay(1000);

    messages_hashes = Object.values(output.messages_by_group)[0];

    Object.values(output.group_messages_contents).map(
      (message_content: any) => {
        messages_contents.push(message_content[0].signed_header.header.content);
        messages_read_list.push(message_content[1]);
      }
    );

    // THE FIRST MESSAGE RETURNED TO THE UI HAVE TO BE THE LAST MESSAGE SENT (MESSAGE#3)
    t.deepEqual(messages_hashes, [message_id_3]);
    t.deepEqual(messages_contents[0].author, charliePubKey);
    t.deepEqual(messages_contents[0].entry_hash, message_id_3);
    t.deepEqual(Object.values(messages_read_list[0]).length, 0);

    // FOR THE NEXT CALL TO FECTH THE NEXT BATCH WE HAVE TO ASSIGN THE FIELDS LAST_FETCHED AND LAST_MESSAGE_TIMESTAMP

    let last_fetched = message_id_3;
    let last_message_timestamp = messages_contents[0].timestamp;

    filter.last_fetched = last_fetched;
    filter.last_message_timestamp = last_message_timestamp;

    output = await getNextBatchGroupMessage(filter)(bobby_conductor);
    await delay(1000);

    messages_contents = [];
    messages_read_list = [];

    messages_hashes = Object.values(output.messages_by_group)[0];

    Object.values(output.group_messages_contents).map(
      (message_content: any) => {
        messages_contents.push(message_content[0].signed_header.header.content);
        messages_read_list.push(message_content[1]);
      }
    );

    // THE SECOND MESSAGE RETURNED TO THE UI HAVE TO BE THE 2° MESSAGE SENT (MESSAGE#2)
    t.deepEqual(messages_hashes, [message_id_2]);
    t.deepEqual(messages_contents[0].author, bobbyPubKey);
    t.deepEqual(messages_contents[0].entry_hash, message_id_2);
    t.deepEqual(Object.values(messages_read_list[0]).length, 1);

    // THIRD CALL TO GET_THE NEXT_BATCH OF MESSAGES SHOULD RETURN THE FIRST MESSAGE SENT

    last_fetched = message_id_2;
    last_message_timestamp = messages_contents[0].timestamp;

    filter.last_fetched = last_fetched;
    filter.last_message_timestamp = last_message_timestamp;

    output = await getNextBatchGroupMessage(filter)(alice_conductor);
    await delay(1000);

    messages_contents = [];
    messages_read_list = [];

    messages_hashes = Object.values(output.messages_by_group)[0];

    Object.values(output.group_messages_contents).map(
      (message_content: any) => {
        messages_contents.push(message_content[0].signed_header.header.content);
        messages_read_list.push(message_content[1]);
      }
    );

    //THE THIRD MESSAGE RETURNED TO THE UI HAVE TO BE THE 1° MESSAGE SENT (MESSAGE#1)
    t.deepEqual(messages_hashes, [message_id_1]);
    t.deepEqual(messages_contents[0].author, alicePubKey);
    t.deepEqual(messages_contents[0].entry_hash, message_id_1);
    t.deepEqual(Object.values(messages_read_list[0]).length, 2);

    //TRY TO GET A MESSAGES BEYOND THE LAST MESSAGE OF THE GROUP

    last_fetched = message_id_1;
    last_message_timestamp = messages_contents[0].timestamp;

    filter.last_fetched = last_fetched;
    filter.last_message_timestamp = last_message_timestamp;

    output = await getNextBatchGroupMessage(filter)(alice_conductor);
    await delay(1000);

    messages_contents = [];
    messages_read_list = [];

    messages_hashes = Object.values(output.messages_by_group)[0];

    Object.values(output.group_messages_contents).map(
      (message_content: any) => {
        messages_contents.push(message_content[0].signed_header.header.content);
        messages_read_list.push(message_content[1]);
      }
    );

    //WE SHOULD RECEIVED NOTHING HERE
    t.deepEqual(messages_hashes, []);
  });
}

function getMessagesByGroupByTimestampTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "Tests for get messages by group by timestamp",
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

      let { group_id, content } = await createGroup(create_group_input)(
        alice_conductor
      );

      await delay();

      const group1Messages: any[] = [];

      const feb9Message1 = await sendMessageWithDate(alice_conductor, {
        group_id,
        payload: { Text: { payload: "message 1 sent on February 9" } },
        sender: alicePubKey,
        date: new Date(2021, 1, 9).getTime(),
      });

      await delay();

      group1Messages.push(feb9Message1);

      const feb9Message2 = await sendMessageWithDate(bobby_conductor, {
        group_id,
        payload: { Text: { payload: "message 2 sent on February 9" } },
        sender: bobbyPubKey,
        date: new Date(2021, 1, 9).getTime(),
      });

      await delay();

      group1Messages.push(feb9Message2);

      const feb9Message3 = await sendMessageWithDate(charlie_conductor, {
        group_id,
        payload: { Text: { payload: "message 3 sent on February 9" } },
        sender: charliePubKey,
        date: new Date(2021, 1, 9).getTime(),
      });

      await delay();

      group1Messages.push(feb9Message3);

      const feb9Message4 = await sendMessageWithDate(alice_conductor, {
        group_id,
        payload: { Text: { payload: "message 4 sent on February 9" } },
        sender: alicePubKey,
        date: new Date(2021, 1, 9).getTime(),
      });

      await delay();

      group1Messages.push(feb9Message4);

      const feb10 = await sendMessageWithDate(alice_conductor, {
        group_id,
        payload: { Text: { payload: "message 1 sent on February 10" } },
        sender: alicePubKey,
        date: new Date(2021, 1, 10).getTime(),
      });

      await delay();

      const unreadMessages = await alice_conductor.call(
        "group",
        "get_messages_by_group_by_timestamp",
        {
          group_id,
          date: dateToTimestamp(new Date(2021, 1, 9)),
          payload_type: {
            Text: null,
          },
        }
      );

      await delay();

      evaluateMessagesByGroupByTimestampResult([], unreadMessages, t);

      await alice_conductor.call("group", "read_group_message", {
        group_id,
        reader: bobbyPubKey,
        timestamp: dateToTimestamp(new Date(2021, 1, 9)),
        members: content.members,
        message_ids: group1Messages.map((message) => message.id),
      });
      await delay();

      const messagesOnFeb9 = await alice_conductor.call(
        "group",
        "get_messages_by_group_by_timestamp",
        {
          group_id,
          date: dateToTimestamp(new Date(2021, 1, 9)),
          payload_type: {
            Text: null,
          },
        }
      );

      await delay();

      evaluateMessagesByGroupByTimestampResult(
        group1Messages,
        messagesOnFeb9,
        t
      );

      const unreadMessagesOnFeb10 = await alice_conductor.call(
        "group",
        "get_messages_by_group_by_timestamp",
        {
          group_id,
          date: dateToTimestamp(new Date(2021, 1, 10)),
          payload_type: {
            Text: null,
          },
        }
      );
      await delay();

      evaluateMessagesByGroupByTimestampResult([], unreadMessagesOnFeb10, t);

      await alice_conductor.call("group", "read_group_message", {
        group_id,
        reader: bobbyPubKey,
        timestamp: dateToTimestamp(new Date(2021, 1, 10)),
        members: content.members,
        message_ids: [feb10].map((message) => message.id),
      });
      await delay();

      const messagesOnFeb10 = await alice_conductor.call(
        "group",
        "get_messages_by_group_by_timestamp",
        {
          group_id,
          date: dateToTimestamp(new Date(2021, 1, 10)),
          payload_type: {
            Text: null,
          },
        }
      );
      await delay();
      evaluateMessagesByGroupByTimestampResult([feb10], messagesOnFeb10, t);
    }
  );
}

function getLatestMessagesForAllGroupsTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "get_latest_messages_for_all_groups test",
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

      init(alice_conductor);
      init(bobby_conductor);
      init(charlie_conductor);

      let messages_hashes: any = [];
      let messages_contents: any = [];
      let messages_read_list: any = [];

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let create_group_input_2 = {
        name: "Group_name_2",
        members: [alicePubKey, charliePubKey],
      };

      let group_1 = await createGroup(create_group_input)(alice_conductor);
      await delay(500);

      let group_2 = await createGroup(create_group_input_2)(alice_conductor);
      await delay(500);

      // WE SEND ONE MESSAGE PER GROUP CREATED AND WE'LL SEE IF THE APP ITS DOING WHAT WE EXPECT IT TO DO

      let {
        id: message_id_1,
        content: alice_message_content,
      } = await sendMessage(alice_conductor, {
        group_id: group_1.group_id,
        payload_input: { Text: { payload: "How are you, Bob?!" } },
        sender: alicePubKey,
      });

      await delay(200);

      let {
        id: message_id_2,
        content: bobby_meesage_content,
      } = await sendMessage(bobby_conductor, {
        group_id: group_2.group_id,
        payload_input: { Text: { payload: "Hi alice!" } },
        sender: bobbyPubKey,
      });

      await delay(500);

      //THEN WE GET THE LATEST MESSAGES FOR ALL THE GROUPS

      let output = await getLatestMessagesForAllGroups(1)(alice_conductor);

      await delay(1000);

      messages_hashes = Object.values(output.messages_by_group)[0];

      Object.values(output.group_messages_contents).map(
        (message_content: any) => {
          messages_contents.push(
            message_content[0].signed_header.header.content
          );
          messages_read_list.push(message_content[1]);
        }
      );

      console.log("messages_hashes ", { a: message_id_1, b: message_id_2 });

      console.log("output", messages_hashes);
      console.log("output", messages_contents);
      console.log("output", messages_read_list);
    }
  );
}

function sendMessageswithFilesTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "send messages with files",
    async (s: ScenarioApi, t) => {
      const [alice, bobby] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);

      await s.shareAllNodes([alice, bobby]);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];

      init(alice_conductor);
      init(bobby_conductor);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey],
      };

      let { content, group_id, group_revision_id } = await createGroup(
        create_group_input
      )(alice_conductor);
      await delay(500);

      let message_1 = await sendMessage(alice_conductor, {
        group_id,
        payload_input: {
          Text: {
            payload: "Hi bob i'm sending you the text file i told you about!",
          },
        },
        sender: alicePubKey,
      });
      await delay(1000);

      let file_metadata = {
        file_name: "my_file",
        file_size: 20,
        file_type: "Other",
      };

      let text: string = "The quick brown fox jumps over the lazy dog.";
      let file_bytes = Int8Array.from(strToUtf8Bytes(text));

      let payload_input = {
        File: {
          metadata: file_metadata,
          file_type: { Other: null },
          file_bytes: file_bytes,
        },
      };

      let message_2 = await sendMessage(alice_conductor, {
        group_id,
        sender: alicePubKey,
        payload_input: payload_input,
      });
      await delay(1000);

      let img_path = path.join(__dirname, "/files/img.png");
      let thumbnail_bytes = Int8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      let img_bytes = fs.readFileSync(img_path);

      let img_metadata = {
        file_name: "img.png",
        file_size: 20,
        file_type: "Image",
      };

      let payload_input_2 = {
        File: {
          metadata: img_metadata,
          file_type: { Image: { thumbnail: thumbnail_bytes } },
          file_bytes: Int8Array.from(img_bytes),
        },
      };

      let message_3 = await sendMessage(bobby_conductor, {
        group_id,
        payload_input: {
          Text: {
            payload:
              "Wow nice thank you, i'm doing this on photoshop maybe you can give me feedback",
          },
        },
        sender: bobbyPubKey,
      });
      await delay(1000);

      let message_4 = await sendMessage(bobby_conductor, {
        group_id,
        sender: bobbyPubKey,
        payload_input: payload_input_2,
      });
      await delay(1000);

      let pdf1_metadata = {
        file_name: "message_5.pdf",
        file_size: 20,
        file_type: "Other",
      };

      let pdf1_path = path.join(__dirname, "/files/message_5.pdf");
      let pdf1_bytes = fs.readFileSync(pdf1_path);

      let payload_input_3 = {
        File: {
          metadata: pdf1_metadata,
          file_type: { Other: null },
          file_bytes: Int8Array.from(pdf1_bytes),
        },
      };

      let message_5 = await sendMessage(bobby_conductor, {
        group_id,
        sender: bobbyPubKey,
        payload_input: payload_input_3,
      });
      await delay(1000);

      let pdf2_metadata = {
        file_name: "message_6.pdf",
        file_size: 20,
        file_type: "Other",
      };

      let pdf2_path = path.join(__dirname, "/files/message_6.pdf");
      let pdf2_bytes = fs.readFileSync(pdf2_path);

      let payload_input_4 = {
        File: {
          metadata: pdf2_metadata,
          file_type: { Other: null },
          file_bytes: Int8Array.from(pdf2_bytes),
        },
      };

      let message_6 = await sendMessage(alice_conductor, {
        group_id,
        sender: alicePubKey,
        payload_input: payload_input_4,
      });
      await delay(2000);

      let messages: { id: Buffer; timestamp: [] }[] = [];

      messages.push({
        id: message_6.id,
        timestamp: message_6.content.created,
      });
      messages.push({
        id: message_5.id,
        timestamp: message_5.content.created,
      });
      messages.push({
        id: message_4.id,
        timestamp: message_4.content.created,
      });
      messages.push({
        id: message_3.id,
        timestamp: message_3.content.created,
      });
      messages.push({
        id: message_2.id,
        timestamp: message_2.content.created,
      });
      messages.push({
        id: message_1.id,
        timestamp: message_1.content.created,
      });

      let filter = {
        group_id,
        last_fetched: null,
        last_message_timestamp: null,
        batch_size: 6,
        payload_type: { File: null },
      };

      let filter_2 = {
        group_id,
        last_fetched: null,
        last_message_timestamp: null,
        batch_size: 6,
        payload_type: { All: null },
      };

      let group_messages = await getNextBatchGroupMessage(filter)(
        bobby_conductor
      );
      await delay(2000);

      let group_messages_2 = await getNextBatchGroupMessage(filter_2)(
        alice_conductor
      );
      await delay(2000);

      t.deepEqual(
        [
          messages[0].id,
          messages[1].id,
          messages[2].id,
          messages[3].id,
          messages[4].id,
          messages[5].id,
        ],
        Object.values(group_messages_2.messages_by_group)[0]
      );

      t.deepEqual(
        [messages[0].id, messages[1].id, messages[2].id, messages[4].id],
        Object.values(group_messages.messages_by_group)[0]
      );

      let messages_with_files = [
        messages[0].id,
        messages[1].id,
        messages[2].id,
        messages[4].id,
      ];

      let filter_3 = {
        group_id,
        last_fetched: null,
        last_message_timestamp: null,
        batch_size: 1,
        payload_type: { File: null },
      };

      let messages_one_by_one: Buffer[] = await getMessagesInBatches(
        filter_3,
        bobby_conductor,
        messages_with_files
      );

      t.deepEqual(messages_one_by_one, messages_with_files);
    }
  );
}

function sendLargeSetOfFilesTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "we should send and then return a large set of messages with files",
    async (s: ScenarioApi, t) => {
      const [alice, bobby] = await s.players([config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);

      await s.shareAllNodes([alice, bobby]);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];

      init(alice_conductor);
      init(bobby_conductor);

      let file_name: string;
      let day = 9;
      let date: number = new Date(2021, 1, day).getTime();
      let file_path;
      let file_bytes;
      let messages: Buffer[] = [];
      let timestamps: number[][] = [];
      let thumbnail_bytes = Int8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      let total: any = [];

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey],
      };

      let { group_id, content } = await createGroup(create_group_input)(
        alice_conductor
      );
      await delay(1000);

      for (let i = 0; i < 25; i++) {
        file_name = `/files/Icon${i + 1}.png`;
        file_path = path.join(__dirname, file_name);
        file_bytes = fs.readFileSync(file_path);

        let file_metadata = {
          file_name: `Ìcon${i + 1}.png`,
          file_size: 20,
          file_type: "Image",
        };

        let payload_input = {
          File: {
            metadata: file_metadata,
            file_type: { Image: { thumbnail: thumbnail_bytes } },
            file_bytes: Int8Array.from(file_bytes),
          },
        };

        let message = await sendMessage(alice_conductor, {
          group_id,
          sender: alicePubKey,
          payload_input,
        });
        await delay(1000);
        messages.push(message.id);

        date += 1000;

        if ((i + 1) % 5 == 0) {
          day++;
          date = new Date(2021, 3, day).getTime();
        }
      }

      messages.reverse();

      let filter = {
        group_id,
        last_fetched: null,
        last_message_timestamp: null,
        batch_size: 5,
        payload_type: { File: null },
      };

      let output = await getMessagesInBatches(
        filter,
        bobby_conductor,
        messages
      );
      await delay(5000);

      console.log(messages);
      console.log(messages.length);
      console.log("hey");
      console.log(output);
      console.log(output.length);

      t.deepEqual(messages, output);
    }
  );
}

function fetchFilesForAParticularDateTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "we should send and then return a large set of messages with files",
    async (s: ScenarioApi, t) => {
      const [alice, bobby] = await s.players([config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);

      await s.shareAllNodes([alice, bobby]);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];

      init(alice_conductor);
      init(bobby_conductor);

    let create_group_input = {
      name: "Group_name",
      members: [bobbyPubKey],
    };

    let { content, group_id, group_revision_id } = await createGroup( create_group_input )(alice_conductor);
    await delay(500);

//    let file1_payload_input = generateFileMessage("Icon1.png", "Image", thumbnail);


    let dates:number[] =[
      new Date(2021, 1, 9).getTime(),
      new Date(2021, 1, 10).getTime(),
      new Date(2021, 1, 11).getTime(),
      new Date(2021, 1, 12).getTime(),
      new Date(2021, 1, 13).getTime()
    ];
  
    //FIRST I SEND 5 MESSAGES ONE PER DAY FOR 5 DAYS 

    let result = await sendMessaggesWithFilesInDiferentDates(group_id, alice_conductor, alicePubKey, "Image", dates);

    if(result){

      let messages:any = result.messages;

      //THEN I TRY TO GET THOSE MESSAGES BACK AGAIN HERE BUT THEY ARE NOT BEING RETRIEVED 
      let result2 = await getMessagesWithTimestamps(alice_conductor, group_id, dates, "All");

      console.log("hey");
      console.log(result2);

      let filter = {
        group_id,
        last_fetched: null,
        last_message_timestamp: null,
        batch_size: 5,
        payload_type: { File: null },
      };

      //HERE I CHECK THOSE MESSAGES AWAS SENDED TO THE GIVEN GROUP 

      let result3 = await getMessagesInBatches(filter,alice_conductor,result2);
      await delay(10000);

      console.log("result 3 ");

      console.log(result3);
      
      
      

    }else{

      t.fail("error");

    }

  })
}

function generateFileMessage(file_name, file_type, file_type_input){

  let file_metadata = {
    file_name,
    file_size: 20,
    file_type,
  };

  file_name = `/files/${file_name}`;
  let file_path = path.join(__dirname, file_name);
  let file_bytes = fs.readFileSync(file_path);

  let payload_input = {
    File: {
      metadata: file_metadata,
      file_type:file_type_input,
      file_bytes: Int8Array.from(file_bytes),
    }
  };

  return payload_input;
}

async function sendMessaggesWithFilesInDiferentDates(group_id,sender_conductor, sender_pubKey, message_type, dates){

  let messages:{}[] = [];

  let thumbnail_bytes = Int8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  let file_type_input:any = null;

  switch(message_type){
    case "Image":
        file_type_input = { Image: { thumbnail: thumbnail_bytes } };
      break;
    case "Video":
        file_type_input = { Video: { thumbnail: thumbnail_bytes } };
      break;
    default: return;  
  }

  for (let i = 0; i < dates.length; i++) {
    
    let file_name = `Icon${i+1}.png`;
    let payload = generateFileMessage(file_name, message_type, file_type_input);

    let result = await sendMessageWithDate( sender_conductor ,{group_id, payload, sender:sender_pubKey, date: dates[i]});
    await delay(1000);

    messages.push(result);
    
  }
  return {
    messages,
  };
}
async function getMessagesInBatches(filter, conductor, messages_with_files) {
  let group_messages;
  let output: Buffer[] = [];
  let iterations = messages_with_files.length / filter.batch_size; // this is onnly valid if the messages is % of the batch size

  let messages_by_group: any = [];
  let messages_contents: any = [];

  for (let i = 0; i < iterations; i++) {
    group_messages = await getNextBatchGroupMessage(filter)(conductor);
    await delay(2000);

    if (Object.values(group_messages.messages_by_group).length == 0) {
      break;
    }

    messages_by_group = Object.values(group_messages.messages_by_group)[0];

    output = output.concat(messages_by_group);

    Object.values(group_messages.group_messages_contents).forEach(
      (element: any) => {
        let entry_hash: Buffer =
          element[0].signed_header.header.content.entry_hash;
        let timestamp: [] = element[0].signed_header.header.content.timestamp;

        messages_contents.push({
          entry_hash,
          timestamp,
        });


        console.log(timestamp);
        
      }
    );

    messages_contents.forEach((element: any) => {
      let buffer: Buffer = messages_by_group[messages_by_group.length - 1];
      let buffer2: Buffer = element.entry_hash;

      if (Buffer.compare(buffer, buffer2) == 0) {
        console.log(buffer);
        console.log(buffer2);

        filter.last_fetched = element.entry_hash;
        filter.last_message_timestamp = element.timestamp;
      }
    });

    messages_by_group = [];
    messages_contents = [];
  }

  return output;
}

async function  getMessagesWithTimestamps(conductor,group_id, dates, messages_type){

  let payload_type:any = null; 
  
  switch(messages_type){
    case "Text":
      payload_type = { Text: null,};
      break;    
    case "File":
      payload_type = { File: null,};
      break;
    case "All":
      payload_type = { All: null,};
      break;
  }

  let output:any = [];

  for (let i = 0; i < dates.length; i++) {

    let result = await getMessagesByGroupByTimestamp({
      group_id,
      date: dateToTimestamp(new Date(dates[i])), 
      payload_type, 
    })(conductor);

    console.log(dateToTimestamp(new Date(dates[i])));
    
    await delay(1000);
    output.push(result);    
  }

  return output;
}

const evaluateMessagesByGroupByTimestampResult = (
  referenceMessages,
  fetchedMessages,
  t
) =>
  t.deepEqual(
    JSON.stringify(Object.values(fetchedMessages["messages_by_group"])[0]),
    JSON.stringify(referenceMessages.map((message) => message.id))
  );

export {
  getMessagesByGroupByTimestampTest,
  groupTypingIndicatorTest,
  sendMessageTest,
  readGroupMessageTest,
  getNextBatchOfMessagesTest,
  getLatestMessagesForAllGroupsTest,
  sendMessageswithFilesTest,
  sendLargeSetOfFilesTest,
  fetchFilesForAParticularDateTest,
};
