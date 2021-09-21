import { Profile } from "../../../profile/types";
import { ThunkAction } from "../../../types";
import { P2PMessage, P2PMessageReceipt } from "../../types";

export const getP2PState =
  (conversant: Profile): ThunkAction =>
  async (dispatch, getState) => {
    let state = { ...getState().p2pmessages };

    let messagesWithConversant = state.conversations[conversant.id];
    let errMsgs: P2PMessage[] = state.errMsgs[conversant.id]
      ? state.errMsgs[conversant.id]
      : [];

    let filteredMessages: {
      message: P2PMessage;
      receipt?: P2PMessageReceipt;
    }[] = messagesWithConversant
      ? messagesWithConversant.messages.map((messageID) => {
          let message = state.messages[messageID];
          let receiptIDs = message.receipts;
          let filteredReceipts = receiptIDs.map((id) => {
            let receipt = state.receipts[id];
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
          return { message: message, receipt: latestReceipt };
        })
      : [];
    errMsgs.forEach((errMsg: P2PMessage) => {
      const filteredMessage: {
        message: P2PMessage;
        receipt?: P2PMessageReceipt;
      } = {
        message: errMsg,
      };
      filteredMessages.push(filteredMessage);
    });
    filteredMessages.sort((x, y) => {
      return x.message.timestamp.getTime() - y.message.timestamp.getTime();
    });

    return filteredMessages;
  };
