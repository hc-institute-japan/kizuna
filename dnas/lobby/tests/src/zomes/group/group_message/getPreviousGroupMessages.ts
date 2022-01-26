import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import {
  createGroup,
  getPreviousGroupMessages,
  readGroupMessage,
  sendMessage,
} from "../zome_fns";

export function getPreviousGroupMessagesTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "test to get the previous batch of message",
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

      // signal handlers assignment
      alice.setSignalHandler((signal) => {});
      bobby.setSignalHandler((signal) => {});
      charlie.setSignalHandler((signal) => {});

      await delay();

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
      await delay();

      // 1 - get a batch for a group without messages

      filter = {
        groupId,
        lastFetched: null,
        lastMessageTimestamp: null,
        batchSize: 5,
        payloadType: {
          type: "TEXT",
          payload: null,
        },
      };

      output = await getPreviousGroupMessages(filter)(bobby_conductor);
      await delay();

      messages_hashes = Object.values(output.messagesByGroup)[0];
      messages_contents = Object.values(output.groupMessagesContents);

      t.deepEqual(messages_hashes, []);
      t.deepEqual(messages_contents, []);

      // 2 - get a batch for a group with messages (this test have a batch size bigger than the number of messagges for this group)

      // first messages send to this group (this message will be read by bobby and charlie)
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

      output = await getPreviousGroupMessages(filter)(bobby_conductor);
      await delay();

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

      // test get batches of one message per call test made using 3 messages

      // the sencond message will only be read by alice
      let { id: message_id_2, content: bobby_meesage_content } =
        await sendMessage(bobby_conductor, {
          groupId,
          payloadInput: {
            type: "TEXT",
            payload: { payload: "Hi alice!" },
          },
          sender: bobbyPubKey,
        });

      await delay();

      group_message_read_data.messageIds = [message_id_2];
      group_message_read_data.reader = alicePubKey;
      group_message_read_data.timestamp = bobby_meesage_content.created;

      await readGroupMessage(group_message_read_data)(alice_conductor);

      await delay();

      // third message havent been read yet by any member

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

      filter.batchSize = 1;

      output = await getPreviousGroupMessages(filter)(bobby_conductor);
      await delay();

      messages_hashes = Object.values(output.messagesByGroup)[0];

      Object.values(output.groupMessagesContents).map(
        (message_content: any) => {
          messages_contents.push(
            message_content.groupMessageElement.signedHeader.header.content
          );
          messages_read_list.push(message_content.readList);
        }
      );

      // the first message returned to the ui have to be the last message sent (message#3)
      t.deepEqual(messages_hashes, [message_id_3]);
      t.deepEqual(messages_contents[0].author, charliePubKey);
      t.deepEqual(messages_contents[0].entry_hash, message_id_3);
      t.deepEqual(Object.values(messages_read_list[0]).length, 0);

      // for the next call to fecth the next batch we have to assign the fields last_fetched and last_message_timestamp

      let last_fetched = message_id_3;
      let last_message_timestamp = messages_contents[0].timestamp;

      filter.lastFetched = last_fetched;
      filter.lastMessageTimestamp = last_message_timestamp;

      output = await getPreviousGroupMessages(filter)(bobby_conductor);
      await delay();

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

      // the second message returned to the ui have to be the 2° message sent (message#2)
      t.deepEqual(messages_hashes, [message_id_2]);
      t.deepEqual(messages_contents[0].author, bobbyPubKey);
      t.deepEqual(messages_contents[0].entry_hash, message_id_2);
      t.deepEqual(Object.values(messages_read_list[0]).length, 1);

      // third call to get_the next_batch of messages should return the first message sent

      last_fetched = message_id_2;
      last_message_timestamp = messages_contents[0].timestamp;

      filter.lastFetched = last_fetched;
      filter.lastMessageTimestamp = last_message_timestamp;

      output = await getPreviousGroupMessages(filter)(alice_conductor);
      await delay();

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

      // the third message returned to the ui have to be the 1° message sent (message#1)
      t.deepEqual(messages_hashes, [message_id_1]);
      t.deepEqual(messages_contents[0].author, alicePubKey);
      t.deepEqual(messages_contents[0].entry_hash, message_id_1);
      t.deepEqual(Object.values(messages_read_list[0]).length, 2);

      // try to get a messages beyond the last message of the group

      last_fetched = message_id_1;
      last_message_timestamp = messages_contents[0].timestamp;

      filter.lastFetched = last_fetched;
      filter.lastMessageTimestamp = last_message_timestamp;

      output = await getPreviousGroupMessages(filter)(alice_conductor);
      await delay();

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

      // we should received nothing here
      t.deepEqual(messages_hashes, []);
    }
  );
  orchestrator.run();
}
