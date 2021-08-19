import { Profile } from "../../../profile/types";
import { ThunkAction } from "../../../types";

export const getP2PState =
  (conversant: Profile): ThunkAction =>
  async (dispatch, getState) => {
    let conversations = { ...getState().p2pmessages.conversations };
    let messages = { ...getState().p2pmessages.messages };
    let receipts = { ...getState().p2pmessages.receipts };

    let filteredMessages = conversations[conversant.id].messages.map(
      (messageID) => {
        let message = messages[messageID];
        let receiptIDs = message.receipts;
        let filteredReceipts = receiptIDs.map((id) => {
          let receipt = receipts[id];
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
      }
    );
    filteredMessages.sort((x, y) => {
      return x.message.timestamp.getTime() - y.message.timestamp.getTime();
    });

    return filteredMessages;
  };
