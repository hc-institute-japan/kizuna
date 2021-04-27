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
import { Orchestrator } from "@holochain/tryorama";

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

function sendMessageTest(config, installables) {

  let orchestrator = new Orchestrator();

  orchestrator.registerScenario("Tests for text send_message",async (s: ScenarioApi, t) => {
    
    const [alice, bobby, charlie] = await s.players([config, config, config]);

    const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
    const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
    const [[charlie_happ]] = await charlie.installAgentsHapps(installables.one);

    const alicePubKey = alice_happ.agent;
    const bobbyPubKey = bobby_happ.agent;
    const charliePubKey = charlie_happ.agent;

    const alice_conductor = alice_happ.cells[0];
    const bobby_conductor = bobby_happ.cells[0];
    const charlie_conductor = charlie_happ.cells[0];

    init(alice_conductor);
    init(bobby_conductor);
    init(charlie_conductor);

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

    let create_group_input = {
      name: "Group_name",
      members: [bobbyPubKey, charliePubKey],
    };

    let { groupId } = await createGroup(create_group_input)(alice_conductor);
    await delay(1000);

    messagesFromSend.push(
      await sendMessage(alice_conductor, {
        groupId,
        payloadInput: { type: "TEXT", payload: { payload: "Hello" } },
        sender: alicePubKey,
      })
    );
    await delay(1000);

    messagesFromSend.push(
      await sendMessage(alice_conductor, {
        groupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: "How are you, Bob?!" },
        },
        sender: alicePubKey,
      })
    );
    await delay(1000);

    messagesFromSend.push(
      await sendMessage(bobby_conductor, {
        groupId,
        payloadInput: { type: "TEXT", payload: { payload: "Hi alice!" } },
        sender: bobbyPubKey,
      })
    );
    await delay(1000);

    messagesFromSend.push(
      await sendMessage(charlie_conductor, {
        groupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: "Yo, what's up guys?" },
        },
        sender: charliePubKey,
      })
    );
    await delay(1000);

    const group1AliceMesssges = await alice_conductor.call(
      "group",
      "get_all_messages",
      groupId
    );
    await delay(1000);

    const group1BobbyMesssges = await bobby_conductor.call(
      "group",
      "get_all_messages",
      groupId
    );
    await delay(1000);

    const group1CharlieMesssges = await charlie_conductor.call(
      "group",
      "get_all_messages",
      groupId
    );
    await delay(1000);


    t.deepEqual(group1AliceMesssges, group1BobbyMesssges);
    t.deepEqual(group1CharlieMesssges, group1AliceMesssges);
    t.deepEqual(messagesFromSend, group1AliceMesssges);

    const messagesFromSend2: any[] = [];
    let create_group_input2 = {
      name: "Group_name",
      members: [charliePubKey],
    };

    let { groupId: groupId2 } = await createGroup(create_group_input2)(
      bobby_conductor
    );
    await delay(1000);

    messagesFromSend2.push(
      await sendMessage(bobby_conductor, {
        groupId: groupId2,
        payloadInput: {
          type: "TEXT",
          payload: {
            payload: "Yo charlie, this will be the GC for the management!",
          },
        },
        sender: bobbyPubKey,
      })
    );
    await delay(1000);

    
    messagesFromSend2.push(
      await sendMessage(charlie_conductor, {
        groupId: groupId2,
        payloadInput: {
          type: "TEXT",
          payload: {
            payload: "Ayt, thanks!",
          },
        },
        sender: charliePubKey,
      })
    );
    await delay(1000);

    const messages2 = await bobby_conductor.call(
      "group",
      "get_all_messages",
      groupId2
    );
    await delay(5000);

    await evaluateMessagesFromSignal(
      list,
      [...group1AliceMesssges, ...messages2],
      t
    );

    }
  );

  orchestrator.run();
}

function groupTypingIndicatorTest(config, installables) {

  let orchestrator = new Orchestrator();

  orchestrator.registerScenario( "test typing indicator for group chat", async (s: ScenarioApi, t) => {
      
    const [alice, bobby, charlie] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(installables.one);

      // await s.shareAllNodes([alice, bobby, charlie]);

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
        signalHandler(signal, bobby_signal_listener);
      });
      charlie.setSignalHandler((signal) => {
        signalHandler(signal, charlie_signal_listener);
      });

      // init(alice_conductor);
      // init(bobby_conductor);
      // init(charlie_conductor);

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

function readGroupMessageTest(config, installables) {

  let orchestrator = new Orchestrator();

  orchestrator.registerScenario("test read group message", async (s: ScenarioApi, t) => {

      const [alice, bobby, charlie] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(installables.one);

      // await s.shareAllNodes([alice, bobby, charlie]);

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
        signalHandler(signal, alice_signal_listener);
      });
      bobby.setSignalHandler((signal) => {
        signalHandler(signal, bobby_signal_listener);
      });
      charlie.setSignalHandler((signal) => {
        signalHandler(signal, charlie_signal_listener);
      });

      // init(alice_conductor);
      // init(bobby_conductor);
      // init(charlie_conductor);

      await delay(1500);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { content, groupId, group_revision_id } = await createGroup(
        create_group_input
      )(alice_conductor);

      await delay(1500);

      let {
        id: message_id_1,
        content: alice_message_content,
      } = await sendMessage(alice_conductor, {
        groupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: "How are you, Bob?!" },
        },
        sender: alicePubKey,
      });

      await delay(1500);

      let {
        id: message_id_2,
        content: bobby_meesage_content,
      } = await sendMessage(bobby_conductor, {
        groupId,
        payloadInput: { type: "TEXT", payload: { payload: "Hi alice!" } },
        sender: bobbyPubKey,
      });

      await delay(1500);

      let {
        id: message_id_3,
        content: charlie_message_content,
      } = await sendMessage(charlie_conductor, {
        groupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: "Yo, what's up guys?" },
        },
        sender: charliePubKey,
      });

      await delay(1500);

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

      await delay(1500);

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
      await delay(1500);

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
      await delay(1500);

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

function getNextBatchOfMessagesTest(config, installables) {

  let orchestrator = new Orchestrator();

  orchestrator.registerScenario("test to get the next batch of message", async (s: ScenarioApi, t) => {
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

      // init(alice_conductor);
      // init(bobby_conductor);
      // init(charlie_conductor);

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

      let { content, groupId, group_revision_id } = await createGroup(
        create_group_input
      )(alice_conductor);
      await delay(500);

      // 1- GET A BATCH FOR A GROUP WITHOUT MESSAGES

      filter = {
        groupId,
        lastFetched: null,
        lastMessageTimestamp: null,
        batchSize: 5, //THIS BATCH-SIZE CAN BE 0 BUT WE SHOULD MAYBE HANDLE THIS FROM THE BACK-END
        payloadType: {
          type: "TEXT",
          payload: null,
        },
      };

      output = await getNextBatchGroupMessage(filter)(bobby_conductor);
      await delay(1000);

      messages_hashes = Object.values(output.messagesByGroup)[0];
      messages_contents = Object.values(output.groupMessagesContents);

      t.deepEqual(messages_hashes, []);
      t.deepEqual(messages_contents, []);

      // 2- GET A BATCH FOR A GROUP WITH MESSAGES (THIS TEST HAVE A BATCH SIZE BIGGER THAN THE NUMBER OF MESSAGGES FOR THIS GROUP)

      //FIRST MESSAGES SEND TO THIS GROUP (THIS MESSAGE WILL BE READED FOR 2 MEMBERS BOBBY AND CHARLIE )
      let {
        id: message_id_1,
        content: alice_message_content,
      } = await sendMessage(alice_conductor, {
        groupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: "How are you, Bob?!" },
        },
        sender: alicePubKey,
      });

      await delay(500);

      let group_message_read_data = {
        groupId,
        messageIds: [message_id_1],
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

      messages_hashes = Object.values(output.messagesByGroup)[0];

      Object.values(output.groupMessagesContents).map(
        (message_content: any) => {
          messages_contents.push(
            message_content.groupMessageElement.signedHeader.header.content
          );
          messages_read_list.push(message_content.readList);
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
        groupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: "Hi alice!" },
        },
        sender: bobbyPubKey,
      });

      await delay(500);

      group_message_read_data.messageIds = [message_id_2];
      group_message_read_data.reader = alicePubKey;
      group_message_read_data.timestamp = bobby_meesage_content.created;

      await readGroupMessage(group_message_read_data)(alice_conductor);

      await delay(500);

      // THIRD MESSAGE HAVENT BEEN READ YET BY ANY MEMBER

      let {
        id: message_id_3,
        content: charlie_message_content,
      } = await sendMessage(charlie_conductor, {
        groupId,
        payloadInput: {
          type: "TEXT",
          payload: { payload: "Yo, what's up guys?" },
        },
        sender: charliePubKey,
      });

      await delay(500);

      filter.batchSize = 1;

      output = await getNextBatchGroupMessage(filter)(bobby_conductor);
      await delay(1000);

      messages_hashes = Object.values(output.messagesByGroup)[0];

      Object.values(output.groupMessagesContents).map(
        (message_content: any) => {
          messages_contents.push(
            message_content.groupMessageElement.signedHeader.header.content
          );
          messages_read_list.push(message_content.readList);
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

      filter.lastFetched = last_fetched;
      filter.lastMessageTimestamp = last_message_timestamp;

      output = await getNextBatchGroupMessage(filter)(bobby_conductor);
      await delay(1000);

      messages_contents = [];
      messages_read_list = [];

      messages_hashes = Object.values(output.messagesByGroup)[0];

      Object.values(output.groupMessagesContents).map(
        (message_content: any) => {
          messages_contents.push(
            message_content.groupMessageElement.signedHeader.header.content
          );
          messages_read_list.push(message_content.readList);
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

      filter.lastFetched = last_fetched;
      filter.lastMessageTimestamp = last_message_timestamp;

      output = await getNextBatchGroupMessage(filter)(alice_conductor);
      await delay(1000);

      messages_contents = [];
      messages_read_list = [];

      messages_hashes = Object.values(output.messagesByGroup)[0];

      Object.values(output.groupMessagesContents).map(
        (message_content: any) => {
          messages_contents.push(
            message_content.groupMessageElement.signedHeader.header.content
          );
          messages_read_list.push(message_content.readList);
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

      filter.lastFetched = last_fetched;
      filter.lastMessageTimestamp = last_message_timestamp;

      output = await getNextBatchGroupMessage(filter)(alice_conductor);
      await delay(1000);

      messages_contents = [];
      messages_read_list = [];

      messages_hashes = Object.values(output.messagesByGroup)[0];

      Object.values(output.groupMessagesContents).map(
        (message_content: any) => {
          messages_contents.push(
            message_content.groupMessageElement.signedHeader.header.content
          );
          messages_read_list.push(message_content.readList);
        }
      );

      //WE SHOULD RECEIVED NOTHING HERE
      t.deepEqual(messages_hashes, []);
    });
  orchestrator.run();
}

function getMessagesByGroupByTimestampTest(config, installables) {

  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "Tests for get messages by group by timestamp",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(
        installables.one
      );

      // await s.shareAllNodes([alice, bobby, charlie]);

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

      // init(alice_conductor);
      // init(bobby_conductor);
      // init(charlie_conductor);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { groupId, content } = await createGroup(create_group_input)(
        alice_conductor
      );

      await delay();

      const group1Messages: any[] = [];

      const feb9Message1 = await sendMessageWithDate(alice_conductor, {
        groupId,
        payload: {
          type: "TEXT",
          payload: { payload: "message 1 sent on February 9" },
        },
        sender: alicePubKey,
        date: new Date(2021, 1, 9).getTime(),
      });

      await delay();

      group1Messages.push(feb9Message1);

      const feb9Message2 = await sendMessageWithDate(bobby_conductor, {
        groupId,
        payload: {
          type: "TEXT",
          payload: { payload: "message 2 sent on February 9" },
        },
        sender: bobbyPubKey,
        date: new Date(2021, 1, 9).getTime(),
      });

      await delay();

      group1Messages.push(feb9Message2);

      const feb9Message3 = await sendMessageWithDate(charlie_conductor, {
        groupId,
        payload: {
          type: "TEXT",
          payload: { payload: "message 3 sent on February 9" },
        },
        sender: charliePubKey,
        date: new Date(2021, 1, 9).getTime(),
      });

      await delay();

      group1Messages.push(feb9Message3);

      const feb9Message4 = await sendMessageWithDate(alice_conductor, {
        groupId,
        payload: {
          type: "TEXT",
          payload: { payload: "message 4 sent on February 9" },
        },
        sender: alicePubKey,
        date: new Date(2021, 1, 9).getTime(),
      });

      await delay();

      group1Messages.push(feb9Message4);

      const feb10 = await sendMessageWithDate(alice_conductor, {
        groupId,
        payload: {
          type: "TEXT",
          payload: { payload: "message 1 sent on February 10" },
        },
        sender: alicePubKey,
        date: new Date(2021, 1, 10).getTime(),
      });

      await delay();

      await readGroupMessage({
        groupId,
        reader: bobbyPubKey,
        timestamp: dateToTimestamp(new Date(2021, 1, 9)),
        members: content.members,
        messageIds: group1Messages.map((message) => message.id),
      })(alice_conductor);

      await delay();

      const messagesOnFeb9 = await getMessagesByGroupByTimestamp({
        groupId,
        date: dateToTimestamp(new Date(2021, 1, 9)),
        payloadType: {
          type: "TEXT",
          payload: null,
        },
      })(alice_conductor);

      await delay();

      evaluateMessagesByGroupByTimestampResult(
        group1Messages,
        messagesOnFeb9,
        t
      );

      // this should be empty
      const filesOnFeb9 = await getMessagesByGroupByTimestamp({
        groupId,
        date: dateToTimestamp(new Date(2021, 1, 9)),
        payloadType: {
          type: "FILE",
          payload: null,
        },
      })(alice_conductor);

      await delay();
      evaluateMessagesByGroupByTimestampResult([], filesOnFeb9, t);

      await readGroupMessage({
        groupId,
        reader: bobbyPubKey,
        timestamp: dateToTimestamp(new Date(2021, 1, 10)),
        members: content.members,
        messageIds: [feb10].map((message) => message.id),
      })(alice_conductor);

      await delay();

      const messagesOnFeb10 = await getMessagesByGroupByTimestamp({
        groupId,
        date: dateToTimestamp(new Date(2021, 1, 10)),
        payloadType: {
          type: "TEXT",
          payload: null,
        },
      })(alice_conductor);

      await delay();
      evaluateMessagesByGroupByTimestampResult([feb10], messagesOnFeb10, t);
    });

    orchestrator.run();
}

function getLatestMessagesForAllGroupsTest(config, installables) {
  
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario( "get_latest_messages_for_all_groups test", async (s: ScenarioApi, t) => {
      
    const [alice, bobby, charlie] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);
      const [[charlie_happ]] = await charlie.installAgentsHapps(installables.one);

      // await s.shareAllNodes([alice, bobby, charlie]);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;
      const charliePubKey = charlie_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];
      const charlie_conductor = charlie_happ.cells[0];

      // init(alice_conductor);
      // init(bobby_conductor);
      // init(charlie_conductor);

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
        groupId: group_1.groupId,
        payloadInput: {
          type: "TEXT",
          payload: {
            payload: "How are you, Bob?!",
          },
        },
        sender: alicePubKey,
      });

      await delay(200);

      let {
        id: message_id_2,
        content: bobby_meesage_content,
      } = await sendMessage(bobby_conductor, {
        groupId: group_2.groupId,
        payloadInput: {
          type: "TEXT",
          payload: {
            payload: "Hi alice!",
          },
        },
        sender: bobbyPubKey,
      });

      await delay(500);

      //THEN WE GET THE LATEST MESSAGES FOR ALL THE GROUPS

      let output = await getLatestMessagesForAllGroups(1)(alice_conductor);

      await delay(1000);

      messages_hashes = Object.values(output.messagesByGroup)[0];

      Object.values(output.groupMessagesContents).map(
        (message_content: any) => {
          messages_contents.push(
            message_content.groupMessageElement.signedHeader.header.content
          );
          messages_read_list.push(message_content[1]);
        }
      );
    });

    orchestrator.run();
}

function sendMessageswithFilesTest(config, installables) {
  
    let orchestrator = new Orchestrator();

  orchestrator.registerScenario("send messages with files",async (s: ScenarioApi, t) => {
    
    const [alice, bobby] = await s.players([config, config, config]);

      const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
      const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);

      const alicePubKey = alice_happ.agent;
      const bobbyPubKey = bobby_happ.agent;

      const alice_conductor = alice_happ.cells[0];
      const bobby_conductor = bobby_happ.cells[0];

      // init(alice_conductor);
      // init(bobby_conductor);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey],
      };

      let { content, groupId, group_revision_id } = await createGroup(
        create_group_input
      )(alice_conductor);
      await delay(500);

      let message_1 = await sendMessage(alice_conductor, {
        groupId,
        payloadInput: {
          type: "TEXT",
          payload: {
            payload: "Hi bob i'm sending you the text file i told you about!",
          },
        },
        sender: alicePubKey,
      });
      await delay(1000);

      let fileMetadata = {
        fileName: "my_file",
        fileSize: 20,
        fileType: "OTHER",
      };

      let text: string = "The quick brown fox jumps over the lazy dog.";
      let fileBytes = Int8Array.from(strToUtf8Bytes(text));

      let payloadInput = {
        type: "FILE",
        payload: {
          metadata: fileMetadata,
          fileType: { type: "OTHER", payload: null },
          fileBytes: fileBytes,
        },
      };

      let message_2 = await sendMessage(alice_conductor, {
        groupId,
        sender: alicePubKey,
        payloadInput: payloadInput,
      });

      await delay(1000);

      let imgPath = path.join(__dirname, "/files/img.png");
      let thumbnailBytes = Int8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      let imgBytes = fs.readFileSync(imgPath);

      let imgMetadata = {
        fileName: "img.png",
        fileSize: 20,
        fileType: "Image",
      };

      let payloadInput_2 = {
        type: "FILE",
        payload: {
          metadata: imgMetadata,
          fileType: { type: "IMAGE", payload: { thumbnail: thumbnailBytes } },
          fileBytes: Int8Array.from(imgBytes),
        },
      };

      let message_3 = await sendMessage(bobby_conductor, {
        groupId,
        payloadInput: {
          type: "TEXT",
          payload: {
            payload:
              "Wow nice thank you, i'm doing this on photoshop maybe you can give me feedback",
          },
        },
        sender: bobbyPubKey,
      });
      await delay(1000);

      let message_4 = await sendMessage(bobby_conductor, {
        groupId,
        sender: bobbyPubKey,
        payloadInput: payloadInput_2,
      });
      await delay(1000);

      let pdf1Metadata = {
        fileName: "message_5.pdf",
        fileSize: 20,
        fileType: "Other",
      };

      let pdf1Path = path.join(__dirname, "/files/message_5.pdf");
      let pdf1Bytes = fs.readFileSync(pdf1Path);

      let payloadInput_3 = {
        type: "FILE",
        payload: {
          metadata: pdf1Metadata,
          fileType: { type: "OTHER", payload: null },
          fileBytes: Int8Array.from(pdf1Bytes),
        },
      };

      let message_5 = await sendMessage(bobby_conductor, {
        groupId,
        sender: bobbyPubKey,
        payloadInput: payloadInput_3,
      });
      await delay(1000);

      let pdf2Metadata = {
        fileName: "message_6.pdf",
        fileSize: 20,
        fileType: "Other",
      };

      let pdf2Path = path.join(__dirname, "/files/message_6.pdf");
      let pdf2Bytes = fs.readFileSync(pdf2Path);

      let payloadInput_4 = {
        type: "FILE",
        payload: {
          metadata: pdf2Metadata,
          fileType: { type: "OTHER", payload: null },
          fileBytes: Int8Array.from(pdf2Bytes),
        },
      };

      let message_6 = await sendMessage(alice_conductor, {
        groupId,
        sender: alicePubKey,
        payloadInput: payloadInput_4,
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
        groupId,
        lastFetched: null,
        lastMessageTimestamp: null,
        batchSize: 6,
        payloadType: { type: "FILE", payload: null },
      };

      let filter_2 = {
        groupId,
        lastFetched: null,
        lastMessageTimestamp: null,
        batchSize: 6,
        payloadType: { type: "ALL", payload: null },
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
        Object.values(group_messages_2.messagesByGroup)[0]
      );

      t.deepEqual(
        [messages[0].id, messages[1].id, messages[2].id, messages[4].id],
        Object.values(group_messages.messagesByGroup)[0]
      );

      let messages_with_files = [
        messages[0].id,
        messages[1].id,
        messages[2].id,
        messages[4].id,
      ];

      let filter_3 = {
        groupId,
        lastFetched: null,
        lastMessageTimestamp: null,
        batchSize: 1,
        payloadType: { type: "FILE", payload: null },
      };

      let messages_one_by_one: Buffer[] = await getMessagesInBatches(
        filter_3,
        bobby_conductor,
        messages_with_files
      );

      t.deepEqual(messages_one_by_one, messages_with_files);
    });

    orchestrator.run();
}

function sendLargeSetOfFilesTest(config, installables) {
  
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario("we should send and then return a large set of messages with files", async (s: ScenarioApi, t) => {
      
    const [alice, bobby] = await s.players([config, config]);

    const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
    const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);

    // await s.shareAllNodes([alice, bobby]);

    const alicePubKey = alice_happ.agent;
    const bobbyPubKey = bobby_happ.agent;

    const alice_conductor = alice_happ.cells[0];
    const bobby_conductor = bobby_happ.cells[0];

      // init(alice_conductor);
      // init(bobby_conductor);

    let fileName: string;
    let day = 9;
    let date: number = new Date(2021, 1, day).getTime();
    let filePath;
    let fileBytes;
    let messages: Buffer[] = [];
    let timestamps: number[][] = [];
    let thumbnail_bytes = Int8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    let total: any = [];

    let create_group_input = {
      name: "Group_name",
      members: [bobbyPubKey],
    };

    let { groupId, content } = await createGroup(create_group_input)(
      alice_conductor
    );
    await delay(1000);

    for (let i = 0; i < 25; i++) {
      fileName = `/files/Icon${i + 1}.png`;
      filePath = path.join(__dirname, fileName);
      fileBytes = fs.readFileSync(filePath);

      let fileMetadata = {
        fileName: `Icon${i + 1}.png`,
        fileSize: 20,
        fileType: "Image",
      };

      let payloadInput = {
        type: "FILE",
        payload: {
          metadata: fileMetadata,
          fileType: {
            type: "IMAGE",
            payload: { thumbnail: thumbnail_bytes },
          },
          fileBytes: Int8Array.from(fileBytes),
        },
      };

      let message = await sendMessage(alice_conductor, {
        groupId,
        sender: alicePubKey,
        payloadInput,
      });
      await delay(1000);
      messages.push(message.id);

      date += 1000;

      if ((i + 1) % 5 == 0) {
        day++;
        date = new Date(2021, 3, day).getTime();
      }
    }

    await delay(1000);
    messages.reverse();

    let filter = {
      groupId,
      lastFetched: null,
      lastMessageTimestamp: null,
      batchSize: 5,
      payloadType: { type: "FILE", payload: null },
    };

    let output = await getMessagesInBatches(
      filter,
      bobby_conductor,
      messages
    );
    await delay(5000);

    t.deepEqual(messages, output);
  }
);
  orchestrator.run();
}

function fetchFilesForAParticularDateTest(config, installables) {

  let orchestrator = new Orchestrator();

orchestrator.registerScenario( "we should send and then return a large set of messages with files",async (s: ScenarioApi, t) => {
    const [alice, bobby] = await s.players([config, config]);

    const [[alice_happ]] = await alice.installAgentsHapps(installables.one);
    const [[bobby_happ]] = await bobby.installAgentsHapps(installables.one);

    // await s.shareAllNodes([alice, bobby]);

    const alicePubKey = alice_happ.agent;
    const bobbyPubKey = bobby_happ.agent;

    const alice_conductor = alice_happ.cells[0];
    const bobby_conductor = bobby_happ.cells[0];

    // init(alice_conductor);
    // init(bobby_conductor);

    let create_group_input = {
      name: "Group_name",
      members: [bobbyPubKey],
    };

    let { content, groupId, groupRevisionId } = await createGroup(
      create_group_input
    )(alice_conductor);
    await delay(500);

    let dates: number[] = [
      new Date(2021, 1, 9).getTime(),
      new Date(2021, 1, 10).getTime(),
      new Date(2021, 1, 11).getTime(),
      new Date(2021, 1, 12).getTime(),
      new Date(2021, 1, 13).getTime(),
    ];

    // FIRST I SEND 5 MESSAGES ONE PER DAY FOR 5 DAYS
    let result = await sendMessaggesWithFilesInDiferentDates(
      groupId,
      alice_conductor,
      alicePubKey,
      "Image",
      dates
    );

    // READ THE MESSAGES
    await readMessagesInDiferentDates(
      bobby_conductor,
      bobbyPubKey,
      groupId,
      content.members,
      result,
      dates
    );

    // GET THE MESSAGES AGAIN
    let result2 = await getMessagesWithTimestamps(
      alice_conductor,
      groupId,
      dates,
      "File"
    );

      t.deepEqual(result, result2);
    }
  );

  orchestrator.run();
}

function generateFileMessage(fileName, fileType, fileTypeInput) {
  let file_metadata = {
    fileName,
    fileSize: 20,
    fileType,
  };

  fileName = `/files/${fileName}`;
  let filePath = path.join(__dirname, fileName);
  let fileBytes = fs.readFileSync(filePath);

  let payload_input = {
    type: "FILE",
    payload: {
      metadata: file_metadata,
      fileType: fileTypeInput,
      fileBytes: Int8Array.from(fileBytes),
    },
  };

  return payload_input;
}
async function sendMessaggesWithFilesInDiferentDates(
  groupId,
  sender_conductor,
  sender_pubKey,
  message_type,
  dates
) {
  let messages: any[] = [];

  let thumbnail_bytes = Int8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  let file_type_input: any = null;

  switch (message_type) {
    case "Image":
      file_type_input = {
        type: "IMAGE",
        payload: { thumbnail: thumbnail_bytes },
      };
      break;
    case "Video":
      file_type_input = {
        type: "VIDEO",
        payload: { thumbnail: thumbnail_bytes },
      };
      break;
    default:
      return;
  }

  for (let i = 0; i < dates.length; i++) {
    let file_name = `Icon${i + 1}.png`;
    let payload = generateFileMessage(file_name, message_type, file_type_input);

    // TATS: Please just use the sendMessage
    let result = await sendMessageWithDate(sender_conductor, {
      groupId,
      payload,
      sender: sender_pubKey,
      date: dates[i],
    });
    await delay(1000);

    messages.push(result.id);
  }
  return messages;
}
async function getMessagesInBatches(filter, conductor, messages_with_files) {
  let group_messages;
  let output: Buffer[] = [];
  let iterations = messages_with_files.length / filter.batchSize; // this is onnly valid if the messages is % of the batch size

  let messages_by_group: any = [];
  let messages_contents: any = [];

  for (let i = 0; i < iterations; i++) {
    group_messages = await getNextBatchGroupMessage(filter)(conductor);
    await delay(2000);

    if (Object.values(group_messages.messagesByGroup).length == 0) {
      break;
    }

    messages_by_group = Object.values(group_messages.messagesByGroup)[0];

    output = output.concat(messages_by_group);

    Object.values(group_messages.groupMessagesContents).forEach(
      (element: any) => {
        let entry_hash: Buffer =
          element.groupMessageElement.signedHeader.header.content.entry_hash;
        let timestamp: [] =
          element.groupMessageElement.signedHeader.header.content.timestamp;

        messages_contents.push({
          entry_hash,
          timestamp,
        });
      }
    );

    messages_contents.forEach((element: any) => {
      let buffer: Buffer = messages_by_group[messages_by_group.length - 1];
      let buffer2: Buffer = element.entry_hash;

      if (Buffer.compare(buffer, buffer2) == 0) {
        filter.lastFetched = element.entry_hash;
        filter.lastMessageTimestamp = element.timestamp;
      }
    });

    messages_by_group = [];
    messages_contents = [];
  }

  return output;
}
async function getMessagesWithTimestamps(
  conductor,
  groupId,
  dates,
  messages_type
) {
  let payloadType: any = null;

  switch (messages_type) {
    case "Text":
      payloadType = { type: "TEXT", payload: null };
      break;
    case "File":
      payloadType = { type: "FILE", payload: null };
      break;
    case "All":
      payloadType = { type: "ALL", payload: null };
      break;
  }

  let output: any = [];

  for (let i = 0; i < dates.length; i++) {
    let result = await getMessagesByGroupByTimestamp({
      groupId,
      date: dateToTimestamp(new Date(dates[i])),
      payloadType,
    })(conductor);

    await delay(2000);

    result = Object.values(result.messagesByGroup)[0];
    output.push(result[0]);
  }

  return output;
}
async function readMessagesInDiferentDates(
  conductor,
  reader,
  groupId,
  members,
  messagesIds,
  dates
) {
  for (let i = 0; i < messagesIds.length; i++) {
    let timestamp = dateToTimestamp(new Date(dates[i]));

    await conductor.call("group", "read_group_message", {
      groupId,
      reader,
      timestamp,
      members,
      messageIds: [messagesIds[i]],
    });
  }
}

const evaluateMessagesByGroupByTimestampResult = (
  referenceMessages,
  fetchedMessages,
  t
) =>
  t.deepEqual(
    JSON.stringify(Object.values(fetchedMessages["messagesByGroup"])[0]),
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
