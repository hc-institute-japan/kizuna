import { Orchestrator } from "@holochain/tryorama";
import { ScenarioApi } from "@holochain/tryorama/lib/api";
import * as fs from "fs";
import * as path from "path";
import { installAgents } from "../../../install";
import { delay } from "../../../utils";
import { sendMessageSignalHandler, strToUtf8Bytes } from "../utils";
import {
  createGroup,
  getPreviousGroupMessages,
  sendMessage,
} from "../zome_fns";
export function sendMessageTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "Tests for text send_message",
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

      let signals = [];
      const messagesSent: any[] = [];

      // set signal hanlders
      alice.setSignalHandler((signal) =>
        sendMessageSignalHandler(signal, signals)(alicePubKey)
      );
      bobby.setSignalHandler((signal) =>
        sendMessageSignalHandler(signal, signals)(bobbyPubKey)
      );
      charlie.setSignalHandler((signal) =>
        sendMessageSignalHandler(signal, signals)(charliePubKey)
      );

      await delay(2000);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { groupId } = await createGroup(create_group_input)(alice_conductor);
      await delay(1000);

      messagesSent.push(
        await sendMessage(alice_conductor, {
          groupId,
          payloadInput: { type: "TEXT", payload: { payload: "Hello" } },
          sender: alicePubKey,
        })
      );
      await delay(1000);

      messagesSent.push(
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

      messagesSent.push(
        await sendMessage(bobby_conductor, {
          groupId,
          payloadInput: { type: "TEXT", payload: { payload: "Hi alice!" } },
          sender: bobbyPubKey,
        })
      );
      await delay(1000);

      messagesSent.push(
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

      t.deepEqual(messagesSent.length, 4);
      t.deepEqual(signals.length, 8);
    }
  );

  orchestrator.run();
}

export function sendMessageswithFilesTest(config) {
  let orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "send messages with files",
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

      await delay();

      // signal handlers assignment
      alice.setSignalHandler((signal) => {});
      bobby.setSignalHandler((signal) => {});
      charlie.setSignalHandler((signal) => {});

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { content, groupId, group_revision_id } = await createGroup(
        create_group_input
      )(alice_conductor);

      await delay();

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

      let text: string = "The quick brown fox jumps over the lazy dog.";
      let fileBytes = Int8Array.from(strToUtf8Bytes(text));

      let payloadInput = {
        type: "FILE",
        payload: {
          metadata: {
            fileName: "my_file",
            fileSize: 20,
            fileType: "OTHER",
          },
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

      let imgPath = path.join(__dirname, "../files/img.png");
      let thumbnailBytes = Int8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      let imgBytes = fs.readFileSync(imgPath);

      let payloadInput_2 = {
        type: "FILE",
        payload: {
          metadata: {
            fileName: "img.png",
            fileSize: 20,
            fileType: "Image",
          },
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

      let pdf1Path = path.join(__dirname, "../files/message_5.pdf");
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

      let pdf2Path = path.join(__dirname, "../files/message_6.pdf");
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

      let group_messages = await getPreviousGroupMessages(filter)(
        bobby_conductor
      );
      await delay(2000);

      let group_messages_2 = await getPreviousGroupMessages(filter_2)(
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

      t.deepEqual(Object.keys(group_messages.groupMessagesContents).length, 3);
    }
  );

  orchestrator.run();
}

export function sendLargeSetOfFilesTest(config) {
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

      const alicePubKey = alice_lobby_happ.agent;
      const bobbyPubKey = bobby_lobby_happ.agent;
      const charliePubKey = charlie_lobby_happ.agent;

      await delay(2000);

      // signal handlers assignment
      alice.setSignalHandler((signal) => {});
      bobby.setSignalHandler((signal) => {});
      charlie.setSignalHandler((signal) => {});

      let fileName: string;
      let filePath;
      let fileBytes;
      let messages: Buffer[] = [];
      let thumbnail_bytes = Int8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      let create_group_input = {
        name: "Group_name",
        members: [bobbyPubKey, charliePubKey],
      };

      let { groupId, content } = await createGroup(create_group_input)(
        alice_conductor
      );
      await delay(1000);

      for (let i = 0; i < 25; i++) {
        fileName = `../files/Icon${i + 1}.png`;
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
      }
      await delay(5000);

      t.deepEqual(messages.length, 25);
    }
  );
  orchestrator.run();
}
