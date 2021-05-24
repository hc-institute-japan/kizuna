import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import { timestampToDate, Uint8ArrayToBase64 } from "../../../../utils/helpers";
import { ThunkAction } from "../../../types";
import { APPEND_MESSAGE, P2PMessage, P2PMessageReceipt } from "../../types";

const receiveP2PMessage = (payload: any): ThunkAction => async (
  dispatch,
  getState,
  { callZome }
) => {
  let receivedMessage = payload.message;

  const [messageTuple, receiptTuple] = receivedMessage;
  const [messageID, message] = messageTuple;
  const [receiptID, receipt] = receiptTuple!;

  // TODO: review why you are still fetching
  callZome({
    zomeName: ZOMES.P2PMESSAGE,
    fnName: FUNCTIONS[ZOMES.P2PMESSAGE].GET_LATEST_MESSAGES,
    payload: 1,
  }).then((res: any) => {
    let messageHash = "u" + Uint8ArrayToBase64(messageID);
    let receiptHash = "u" + Uint8ArrayToBase64(receiptID);

    var payload;
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
          fileHash: Uint8ArrayToBase64(message.payload.payload.metadata.fileHash),
          thumbnail:
            message.payload.payload.fileType.type !== "OTHER"
              ? message.payload.payload.fileType.payload.thumbnail
              : null,
        };
        break;
      default:
        break;
    }

    let p2pMessage: P2PMessage = {
      p2pMessageEntryHash: messageHash,
      author: "u" + Uint8ArrayToBase64(message.author),
      receiver: "u" + Uint8ArrayToBase64(message.receiver),
      payload: payload,
      timestamp: timestampToDate(message.timeSent),
      replyTo: message.replyTo,
      receipts: [receiptHash],
    };

    let messageEntryHash = "u" + Uint8ArrayToBase64(receipt.id[0]);
    let p2pReceipt: P2PMessageReceipt = {
      p2pMessageReceiptEntryHash: "u" + Uint8ArrayToBase64(receiptID),
      p2pMessageEntryHashes: [messageEntryHash],
      timestamp: timestampToDate(receipt.status.timestamp),
      status: receipt.status.status,
    };

    dispatch({
      type: APPEND_MESSAGE,
      state: {
        message: p2pMessage,
        receipt: p2pReceipt,
        key: p2pMessage.author,
      },
    });
  });
};

export default receiveP2PMessage;
