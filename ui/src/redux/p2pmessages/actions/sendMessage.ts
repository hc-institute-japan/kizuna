import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../../redux/error/actions";
import {
  P2PMessage,
  P2PMessageReceipt,
} from "../../../redux/p2pmessages/types";
import { timestampToDate } from "../../../utils/helpers";
import { FilePayloadInput, FileType, TextPayload } from "../../commons/types";
import { MessageInput } from "../types";
import { appendMessage } from "../actions/appendMessage";

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
        dispatch(appendMessage(sentMessage, file ? file.fileBytes : undefined));
        return true;
      }
    } catch (e) {
      // will enter a backoff of max 5 attempts
      const retryRes = await retry({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE,
        payload: input,
      });

      if (retryRes?.type !== "error") {
        console.log("retry success result", retryRes);
        dispatch(appendMessage(retryRes, file ? file.fileBytes : undefined));
        return true;
      } else {
        dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
      }
    }
  };
