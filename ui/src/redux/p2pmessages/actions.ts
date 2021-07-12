import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { pushError } from "../../redux/error/actions";
import {
  P2PConversation,
  P2PMessage,
  P2PMessageConversationState,
  P2PMessageReceipt,
} from "../../redux/p2pmessages/types";
import { dateToTimestamp, timestampToDate } from "../../utils/helpers";
import {
  FilePayloadInput,
  FileType,
  MessageID,
  TextPayload,
} from "../commons/types";
import { ThunkAction } from "../types";
import { Profile } from "../profile/types";
import {
  AgentPubKeyBase64,
  APPEND_MESSAGE,
  APPEND_RECEIPT,
  BatchSize,
  HoloHashBase64,
  MessageInput,
  P2PFile,
  SET_FILES,
  SET_MESSAGES,
} from "./types";

/* HELPER FUNCTIONS */
/* 
    transform HC data structures to UI/redux data structures
*/
export const transformZomeDataToUIData = (
  zomeResults: P2PMessageConversationState,
  contacts: { [key: string]: Profile }
) => {
  // destructure zome hashmap results
  let {
    0: zomeConversations,
    1: zomeMessages,
    2: zomeReceipts,
  } = Object.values(zomeResults);

  // transform conversations
  let transformedConversations: { [key: string]: P2PConversation } = {};
  for (const [key, value] of Object.entries(zomeConversations)) {
    let messageIDs: MessageID[] = value as MessageID[];
    let conversation: P2PConversation = {
      messages: messageIDs,
    };
    transformedConversations[key] = conversation;
  }

  // transform messages
  let transformedMesssages: { [key: string]: P2PMessage } = {};
  for (const [key, value] of Object.entries(zomeMessages)) {
    let { 0: message, 1: receiptArray } = Object(value);
    let payload;
    switch (message.payload.type) {
      case "TEXT":
        payload = message.payload;
        break;
      case "FILE":
        payload = {
          type: "FILE",
          fileName: message.payload.payload.metadata.fileName,
          fileSize: message.payload.payload.metadata.fileSize,
          fileType: message.payload.payload.fileType.type,
          fileHash: serializeHash(message.payload.payload.metadata.fileHash),
          thumbnail:
            message.payload.payload.fileType.type !== "OTHER"
              ? message.payload.payload.fileType.payload.thumbnail
              : null,
        };
        break;
      default:
        break;
    }

    let author = contacts[serializeHash(message.author)];

    let replyToPayload;
    let transformedReplyTo = undefined;
    if (message.replyTo !== null) {
      switch (message.replyTo.payload.type) {
        case "TEXT":
          replyToPayload = message.replyTo.payload;
          break;
        case "FILE":
          replyToPayload = {
            type: "FILE",
            fileName: message.replyTo.payload.payload.metadata.fileName,
            fileSize: message.replyTo.payload.payload.metadata.fileSize,
            fileType: message.replyTo.payload.payload.fileType.type,
            fileHash: serializeHash(
              message.replyTo.payload.payload.metadata.fileHash
            ),
            thumbnail:
              message.replyTo.payload.payload.fileType.type !== "OTHER"
                ? message.replyTo.payload.payload.fileType.payload.thumbnail
                : null,
          };
          break;
        default:
          break;
      }

      transformedReplyTo = {
        p2pMessageEntryHash: serializeHash(message.replyTo.hash),
        author: contacts[serializeHash(message.replyTo.author)],
        receiver: serializeHash(message.replyTo.receiver),
        payload: replyToPayload ? replyToPayload : message.replyTo.payload,
        timestamp: timestampToDate(message.replyTo.timeSent),
        replyTo: message.replyTo,
        receipts: message.replyTo.receipts,
      };
    }

    let p2pMessage: P2PMessage = {
      p2pMessageEntryHash: key,
      author: author,
      receiver: serializeHash(message.receiver),
      payload: payload,
      timestamp: timestampToDate(message.timeSent),
      replyTo: transformedReplyTo ? transformedReplyTo : undefined,
      receipts: receiptArray,
    };

    transformedMesssages[key] = p2pMessage;
  }

  // transform receipts
  let transformedReceipts: { [key: string]: P2PMessageReceipt } = {};
  for (const [key, value] of Object.entries(zomeReceipts)) {
    const { id, status: statusTuple } = Object(value);
    const { status, timestamp } = statusTuple;

    let p2preceipt = {
      p2pMessageReceiptEntryHash: key,
      p2pMessageEntryHashes: id,
      timestamp: timestampToDate(timestamp),
      status: status,
    };

    transformedReceipts[key] = p2preceipt;
  }

  // consolidate transformed objects
  let consolidatedUIObject: P2PMessageConversationState = {
    conversations: transformedConversations,
    messages: transformedMesssages,
    receipts: transformedReceipts,
    files: {},
    typing: {},
  };

  return consolidatedUIObject;
};

/* SETTERS */
/*
    set P2PMessageConversations into the redux state
*/
export const setMessages =
  (state: P2PMessageConversationState): ThunkAction =>
  (dispatch) => {
    dispatch({
      type: SET_MESSAGES,
      state,
    });
    return true;
  };

/* 
    set the FileBytes into the redux state
*/
export const setFiles =
  (filesToFetch: { [key: string]: Uint8Array }): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    const fetchedFiles = await callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
      payload: Object.keys(filesToFetch),
    });

    if (fetchedFiles?.type !== "error") {
      dispatch({
        type: SET_FILES,
        sate: fetchedFiles,
      });
      return true;
    }
  };

/*
    append a message, receipt, file bytes [no fetch] into the redux after a user sends a message
    append a message, receipt, file bytes [with fetch] into the redux after a receiver receives a signal
*/
export const appendMessage =
  (state: {
    message: P2PMessage;
    receipt: P2PMessageReceipt;
    file?: P2PFile;
  }): ThunkAction =>
  async (dispatch) => {
    dispatch({
      type: APPEND_MESSAGE,
      state,
    });
    return true;
  };

/*
    append a receipt into the redux state 
    after receving a signal (e.g., message has been read)
*/
export const appendReceipt =
  (state: P2PMessageReceipt): ThunkAction =>
  async (dispatch) => {
    dispatch({
      type: APPEND_RECEIPT,
      state,
    });
    return true;
  };

/* SENDER */
/* 
    action to send a message
*/
export const sendMessage =
  (
    receiver: string,
    message: string,
    type: string,
    replyTo?: string,
    file?: any
  ): ThunkAction =>
  async (dispatch, getState, { callZome, retry }) => {
    console.log("actions send message");
    let payloadInput;
    if (type === "TEXT") {
      let textPayload: TextPayload = {
        type: "TEXT",
        payload: {
          payload: message.trim(),
        },
      };
      payloadInput = textPayload;
    } else {
      let fileType: FileType = {
        type: file.fileType.type,
        payload:
          file.fileType.type !== "OTHER"
            ? { thumbnail: file.fileType.payload.thumbnail }
            : null,
      };
      let filePayload: FilePayloadInput = {
        type: "FILE",
        payload: {
          metadata: file.metadata,
          fileType: fileType,
          fileBytes: file.fileBytes,
        },
      };
      payloadInput = filePayload;
    }

    // construct the message input structure
    let input: MessageInput = {
      receiver: Buffer.from(deserializeHash(receiver)),
      payload: payloadInput,
      reply_to: replyTo ? Buffer.from(deserializeHash(replyTo)) : undefined,
    };

    // CALL ZOME
    try {
      const sentMessage = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
        payload: input,
      });

      if (sentMessage?.type !== "error") {
        const [messageTuple, receiptTuple] = sentMessage;
        const [messageID, message] = messageTuple;
        const [receiptID, receipt] = receiptTuple!;

        let messageHash = serializeHash(messageID);
        let receiptHash = serializeHash(receiptID);

        let payload;
        switch (message.payload.type) {
          case "TEXT":
            payload = message.payload;
            break;
          case "FILE":
            payload = {
              type: "FILE",
              fileName: message.payload.payload.metadata.fileName,
              fileSize: message.payload.payload.metadata.fileSize,
              fileType: message.payload.payload.fileType.type,
              fileHash: serializeHash(
                message.payload.payload.metadata.fileHash
              ),
              thumbnail:
                message.payload.payload.fileType.type !== "OTHER"
                  ? message.payload.payload.fileType.payload.thumbnail
                  : null,
            };
            break;
          default:
            break;
        }

        let contacts = getState().contacts.contacts;
        let profile = getState().profile;
        if (profile.id !== null && profile.username !== null)
          contacts[profile.id] = { id: profile.id, username: profile.username };

        let transformedReplyTo = undefined;
        let replyToPayload = undefined;
        if (message.replyTo !== null) {
          switch (message.replyTo.payload.type) {
            case "TEXT":
              replyToPayload = message.replyTo.payload;
              break;
            case "FILE":
              replyToPayload = {
                type: "FILE",
                fileName: message.replyTo.payload.payload.metadata.fileName,
                fileSize: message.replyTo.payload.payload.metadata.fileSize,
                fileType: message.replyTo.payload.payload.fileType.type,
                fileHash: serializeHash(
                  message.replyTo.payload.payload.metadata.fileHash
                ),
                thumbnail:
                  message.replyTo.payload.payload.fileType.type !== "OTHER"
                    ? message.replyTo.payload.payload.fileType.payload.thumbnail
                    : null,
              };
              break;
            default:
              break;
          }

          transformedReplyTo = {
            p2pMessageEntryHash: serializeHash(message.replyTo.hash),
            author: contacts[serializeHash(message.replyTo.author)],
            receiver: serializeHash(message.replyTo.receiver),
            payload: replyToPayload ? replyToPayload : message.replyTo.payload,
            timestamp: timestampToDate(message.replyTo.timeSent),
            receipts: [],
          };
        }

        let p2pMessage: P2PMessage = {
          p2pMessageEntryHash: messageHash,
          author: contacts[serializeHash(message.author)],
          receiver: serializeHash(message.receiver),
          payload: payload,
          timestamp: timestampToDate(message.timeSent),
          replyTo: transformedReplyTo ? transformedReplyTo : undefined,
          receipts: [receiptHash],
        };

        let messageEntryHash = serializeHash(receipt.id[0]);
        let p2pReceipt: P2PMessageReceipt = {
          p2pMessageReceiptEntryHash: serializeHash(receiptID),
          p2pMessageEntryHashes: [messageEntryHash],
          timestamp: timestampToDate(receipt.status.timestamp),
          status: receipt.status.status,
        };

        let p2pFile =
          type === "FILE"
            ? {
                fileHash: payload.fileHash,
                fileBytes: file.fileBytes,
              }
            : undefined;

        // DISPATCH TO REDUCER
        dispatch(
          appendMessage({
            message: p2pMessage,
            receipt: p2pReceipt,
            file: p2pFile !== undefined ? p2pFile : undefined,
          })
        );
        return true;
      }
    } catch (e) {
      console.log("actions send error", e);
      await retry({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
        payload: input,
      });
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

/* GETTERS */
/* 
    get the latest messages 
    when the application starts, is refreshed
*/
export const getLatestMessages =
  (size: number): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    try {
      // CALL ZOME
      const batchSize: BatchSize = size;
      const p2pLatestState = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_LATEST_MESSAGES,
        payload: batchSize,
      });

      // DISPATCH TO REDUCER
      if (p2pLatestState?.type !== "error") {
        let contacts = getState().contacts.contacts;
        let profile = getState().profile;
        if (profile.id !== null && profile.username !== null)
          contacts[profile.id] = { id: profile.id, username: profile.username };
        let toDispatch = transformZomeDataToUIData(p2pLatestState, contacts);
        dispatch(setMessages(toDispatch));

        return toDispatch;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

// action to get messages in batches (called while scrolling in chat boxes and media boxes)
export const getNextBatchMessages =
  (
    conversant: AgentPubKeyBase64,
    batch_size: number,
    payload_type: String,
    last_fetched_timestamp?: Date,
    last_fetched_message_id?: HoloHashBase64
  ): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let zome_input = {
      conversant: Buffer.from(deserializeHash(conversant)),
      batch_size: batch_size,
      payload_type: payload_type,
      last_fetched_timestamp: last_fetched_timestamp
        ? dateToTimestamp(last_fetched_timestamp)
        : undefined,
      last_fetched_message_id: last_fetched_message_id
        ? Buffer.from(deserializeHash(last_fetched_message_id))
        : undefined,
    };
    try {
      // CALL ZOME
      const nextBatchOfMessages = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_NEXT_BATCH_MESSAGES,
        payload: zome_input,
      });

      // DISPATCH TO REDUCER
      if (nextBatchOfMessages?.type !== "error") {
        let contacts = getState().contacts.contacts;
        let profile = getState().profile;
        if (profile.id !== null && profile.username !== null)
          contacts[profile.id] = { id: profile.id, username: profile.username };
        let toDispatch = transformZomeDataToUIData(
          nextBatchOfMessages,
          contacts
        );
        if (Object.values(nextBatchOfMessages[1]).length > 0)
          dispatch({
            type: SET_MESSAGES,
            state: toDispatch,
          });
        return nextBatchOfMessages;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

export const getMessagesByAgentByTimestamp =
  (id: string, date: Date, payload_type: String): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let zome_input = {
      conversant: deserializeHash(id),
      date: dateToTimestamp(date),
      payload_type: payload_type,
    };

    try {
      const messagesByDate = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_MESSAGES_BY_AGENT_BY_TIMESTAMP,
        payload: zome_input,
      });

      if (messagesByDate?.type !== "error") {
        let contacts = getState().contacts.contacts;
        let profile = getState().profile;
        if (profile.id !== null && profile.username !== null)
          contacts[profile.id] = { id: profile.id, username: profile.username };
        let transformed = transformZomeDataToUIData(messagesByDate, contacts);
        return transformed;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

// action to mark an array of messages as read (called in the onSeen callback)
export const readMessage =
  (messages: P2PMessage[]): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    console.log("actions read message");
    // CONSTRUCT ZOME INPUT
    // construct the timestamp
    let now = Date.now();
    let seconds = (now / 1000) >> 0;
    let nanoseconds = (now % 1000) * 10 ** 6;
    let timestamp = [seconds, nanoseconds];

    // get hashes of messages to be marked
    let hashes: any = [];
    messages.map((message) =>
      hashes.push(deserializeHash(message.p2pMessageEntryHash))
    );

    // get the sender (sender = conversant since p2p)
    let sender = Buffer.from(deserializeHash(messages[0].author.id));

    let input = {
      message_hashes: hashes,
      sender: sender,
      timestamp: timestamp,
    };

    // CALL ZOME
    const readReceiptMap = await callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].READ_MESSAGE,
      payload: input,
    });

    // DISPATCH TO REDUCER
    if (readReceiptMap?.type !== "error") {
      let [key] = Object.keys(readReceiptMap);

      let messageIDs: string[] = [];
      readReceiptMap[key].id.forEach((id: Uint8Array) => {
        messageIDs.push(serializeHash(id));
      });

      let p2preceipt = {
        p2pMessageReceiptEntryHash: key,
        p2pMessageEntryHashes: messageIDs,
        timestamp: timestampToDate(readReceiptMap[key].status.timestamp),
        status: readReceiptMap[key].status.status,
      };

      dispatch({
        type: APPEND_RECEIPT,
        state: p2preceipt,
      });
      return true;
    }

    // ERROR
    return false;
  };

// action to get the file bytes of a list of file addresses
export const getFileBytes =
  (inputHashes: HoloHashBase64[]): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    let hashes = inputHashes.map((hash) => deserializeHash(hash));
    try {
      const fetchedFiles = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_FILE_BYTES,
        payload: hashes,
      });

      let transformedFiles: { [key: string]: Uint8Array } = {};
      if (fetchedFiles?.type !== "error") {
        Object.keys(fetchedFiles).forEach((key) => {
          transformedFiles[key] = fetchedFiles[key];
        });
        if (Object.entries(transformedFiles).length > 0) {
          dispatch({
            type: SET_FILES,
            state: transformedFiles,
          });
        }
        return transformedFiles;
      }
    } catch (e) {
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };

// action to call typing
// export const isTyping = (agent: AgentPubKey, isTyping: boolean): ThunkAction => async (
export const isTyping =
  (agent: string, isTyping: boolean): ThunkAction =>
  async (dispatch, _getState, { callZome }) => {
    let payload = {
      agent: Buffer.from(deserializeHash(agent)),
      isTyping: isTyping,
    };

    callZome({
      zomeName: ZOMES.P2PMESSAGE,
      fnName: FUNCTIONS[ZOMES.P2PMESSAGE].TYPING,
      payload: payload,
    });

    return null;
  };

export const countUnread =
  (conversant: string): ThunkAction =>
  (dispatch, getState) => {
    const { conversations, messages, receipts } = getState().p2pmessages;
    const conversation = conversations[conversant].messages;
    let unreadCounter = 0;
    conversation.forEach((messageID) => {
      let message = messages[messageID];
      let receiptIDs = message.receipts;
      let filteredReceipts = receiptIDs.map((receiptID) => {
        let receipt = receipts[receiptID];
        return receipt;
      });
      filteredReceipts.sort((a: any, b: any) => {
        let receiptTimestampA = a.timestamp.getTime();
        let receiptTimestampB = b.timestamp.getTime();
        if (receiptTimestampA > receiptTimestampB) return -1;
        if (receiptTimestampA < receiptTimestampB) return 1;
        return 0;
      });
      let latestReceipt = filteredReceipts[0];
      if (latestReceipt.status !== "read" && message.author.id === conversant)
        unreadCounter = unreadCounter + 1;
    });

    return unreadCounter;
  };
