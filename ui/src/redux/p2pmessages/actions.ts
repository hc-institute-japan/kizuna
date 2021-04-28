// import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { ThunkAction } from "../types";
import { TextPayload, FilePayload } from "../commons/types";
import {
  SET_MESSAGES,
  APPEND_MESSAGE,
  MessageInput,
  BatchSize,
  P2PChatFilterBatch,
} from "./types";

import {
  P2PMessageConversationState,
  P2PMessage,
} from "../../redux/p2pmessages/types";
import { AgentPubKey, HoloHash } from "@holochain/conductor-api";
import { FilePayloadInput, FileType } from "../commons/types";
import { Filesystem } from "@capacitor/core";
import { filmOutline } from "ionicons/icons";
import { getConstructorTypeOfClassLikeDeclaration } from "tsutils";

export const setMessages = (
  state: P2PMessageConversationState
): ThunkAction => async (dispatch) => {
  dispatch({
    type: SET_MESSAGES,
    state,
  });
  return true;
};

export const appendMessage = (state: P2PMessage): ThunkAction => async (
  dispatch
) => {
  dispatch({
    type: APPEND_MESSAGE,
    state,
  });
  return true;
};

export const sendMessage = (
  receiver: AgentPubKey,
  message: string,
  type: string,
  replyTo?: HoloHash,
  file?: any
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  var payload;
  if (type == "TEXT") {
    let textPayload: TextPayload = {
      type: "TEXT",
      payload: {
        payload: message,
      },
    };
    payload = textPayload;
  } else {
    // console.log("actions file", file);
    let fileType: FileType = {
      type: file.fileType.type,
      payload:
        file.fileType.type != "OTHER"
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
    payload = filePayload;
  }

  //   console.log("actions", payload);
  let input: MessageInput = {
    receiver: receiver,
    payload: payload,
    reply_to: replyTo,
  };

  const sentMessage = await callZome({
    zomeName: ZOMES.P2PMESSAGE,
    fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
    payload: input,
  });

  if (sentMessage?.type !== "error") {
    dispatch(appendMessage(sentMessage));
    // console.log("actions successfully sent message");
    return true;
  }
  //   console.log("actions failed to send message", sentMessage);
  return false;
};

// TODO: use the aggregator
export const getLatestMessages = (size: number): ThunkAction => async (
  dispatch,
  _getState,
  { callZome }
) => {
  const batchSize: BatchSize = size;

  const messages = await callZome({
    zomeName: ZOMES.P2PMESSAGE,
    fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_LATEST_MESSAGES,
    payload: batchSize,
  });

  if (messages?.type !== "error") {
    // console.log("Actions get latest", messages);
    dispatch(setMessages(messages));
    return messages;
  }
  //   console.log("failed to get latest messages", messages);
  return false;
};

export const getNextBatchMessages = (
  filter: P2PChatFilterBatch
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  //   console.log("actions getting next batch");
  const messages = await callZome({
    zomeName: ZOMES.P2PMESSAGE,
    fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_NEXT_BATCH_MESSAGES,
    payload: filter,
  });

  if (messages?.type !== "error") {
    // console.log("Actions get next batch complete", messages);
    if (Object.values(messages[1]).length > 0) dispatch(setMessages(messages));
    return messages;
  }
  //   console.log("actions failed to get next batch", messages);
  return false;
};

// export const getMessagesByAgentByTimestamp = ({conversant: AgentPubKey, date: Date, payloadType: number}): ThunkAction => async (
//     dispatch,
//     _getState,
//     { callZome }
// ) => {
//     const batchSize: BatchSize = size;

//     const messages = await callZome({
//         zomeName: ZOMES.P2PMESSAGE,
//         fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_LATEST_MESSAGES,
//         payload: batchSize
//     });

//     if (messages?.type !== "error") {
//         return messages;
//     };
//     return false;
// }
