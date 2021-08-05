import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../../redux/error/actions";
import { P2PMessageReceipt } from "../../../redux/p2pmessages/types";
import { timestampToDate } from "../../../utils/helpers";
import { FilePayloadInput, FileType, TextPayload } from "../../commons/types";
import { appendReceipt } from "../actions/appendReceipt";

/* SENDER */
/* 
    action to send a message
*/
export const sendMessage2 =
  (
    receiver: string,
    message: string,
    type: string,
    timestamp: [number, number],
    replyTo?: string,
    file?: any
  ): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
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
    let input = {
      receiver: Buffer.from(deserializeHash(receiver)),
      payload: payloadInput,
      timestamp: timestamp,
      reply_to: replyTo ? Buffer.from(deserializeHash(replyTo)) : undefined,
    };

    // CALL ZOME
    try {
      const deliveredReceipt = await callZome({
        zomeName: ZOMES.P2PMESSAGE,
        fnName: FUNCTIONS[ZOMES.P2PMESSAGE].SEND_MESSAGE_2,
        payload: input,
      });

      console.log("send message 2", deliveredReceipt);

      if (deliveredReceipt?.type !== "error") {
        const [receiptID, receipt] = deliveredReceipt!;
        return receipt;
      }
    } catch (e) {
      console.log(e);
      dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
