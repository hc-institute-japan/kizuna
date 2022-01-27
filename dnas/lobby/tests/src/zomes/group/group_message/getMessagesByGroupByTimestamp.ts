import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import * as fs from "fs";
import * as path from "path";
import { installAgents } from "../../../install";
import { dateToTimestamp, delay } from "../../../utils";
import { sendMessageSignalHandler } from "../utils";
import {
  createGroup,
  getMessagesByGroupByTimestamp,
  readGroupMessage,
  sendMessageWithDate,
} from "../zome_fns";

export function getMessagesByGroupByTimestampTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "Tests for get messages by group by timestamp",
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
      let list = [];

      // set signal hanlders
      alice.setSignalHandler((signal) => {
        sendMessageSignalHandler(signal, list)(alicePubKey);
      });
      bobby.setSignalHandler((signal) => {
        sendMessageSignalHandler(signal, list)(bobbyPubKey);
      });
      charlie.setSignalHandler((signal) => {
        sendMessageSignalHandler(signal, list)(charliePubKey);
      });

      await delay(2000);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { groupId, content } = await createGroup(create_group_input)(
        alice_conductor
      );

      await delay(1000);

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

      await delay(1000);

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

      await delay(1000);

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

      await delay(1000);

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

      await delay(1000);

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

      await delay(1000);

      await readGroupMessage({
        groupId,
        reader: bobbyPubKey,
        timestamp: dateToTimestamp(new Date(2021, 1, 9)),
        members: content.members,
        messageIds: group1Messages.map((message) => message.id),
      })(alice_conductor);

      await delay(1000);

      const messagesOnFeb9 = await getMessagesByGroupByTimestamp({
        groupId,
        date: dateToTimestamp(new Date(2021, 1, 9)),
        payloadType: {
          type: "TEXT",
          payload: null,
        },
      })(alice_conductor);

      await delay(1000);

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

      await delay(1000);

      const messagesOnFeb10 = await getMessagesByGroupByTimestamp({
        groupId,
        date: dateToTimestamp(new Date(2021, 1, 10)),
        payloadType: {
          type: "TEXT",
          payload: null,
        },
      })(alice_conductor);

      await delay(1000);
      evaluateMessagesByGroupByTimestampResult([feb10], messagesOnFeb10, t);
    }
  );

  orchestrator.run();
}

export function fetchFilesForAParticularDateTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "we should send and then return a large set of messages with files",
    async (s: ScenarioApi, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);
      const [alice_lobby_happ] = await installAgents(alice, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(bobby, ["bobby"]);
      const [charlie_lobby_happ] = await installAgents(charlie, ["charlie"]);
      s.shareAllNodes([alice, bobby, charlie]);

      const [alice_conductor] = alice_lobby_happ.cells;
      const [bobby_conductor] = bobby_lobby_happ.cells;

      const alicePubKey = alice_lobby_happ.agent;
      const bobbyPubKey = bobby_lobby_happ.agent;
      const charliePubKey = charlie_lobby_happ.agent;

      await delay(2000);

      // signal handlers assignment
      alice.setSignalHandler((signal) => {});
      bobby.setSignalHandler((signal) => {});
      charlie.setSignalHandler((signal) => {});

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { content, groupId, groupRevisionId } = await createGroup(
        create_group_input
      )(alice_conductor);
      await delay(1000);

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

// helpers

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

function generateFileMessage(fileName, fileType, fileTypeInput) {
  let file_metadata = {
    fileName,
    fileSize: 20,
    fileType,
  };

  fileName = `../files/${fileName}`;
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

const evaluateMessagesByGroupByTimestampResult = (
  referenceMessages,
  fetchedMessages,
  t
) =>
  t.deepEqual(
    JSON.stringify(Object.values(fetchedMessages["messagesByGroup"])[0]),
    JSON.stringify(referenceMessages.map((message) => message.id))
  );
