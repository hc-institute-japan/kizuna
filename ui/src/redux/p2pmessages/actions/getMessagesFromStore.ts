import { ThunkAction } from "../../types";

export const getMessagesFromStore =
  (conversant: string): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    let messageIDs = getState().p2pmessages.conversations[conversant].messages;
    let messages = { ...getState().p2pmessages.messages };
    let receipts = { ...getState().p2pmessages.receipts };

    let filteredMessages = messageIDs.map((messageID: string) => {
      let message = messages[messageID]; // this is undefined
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
    });
    filteredMessages.sort((x, y) => {
      return x.message.timestamp.getTime() - y.message.timestamp.getTime();
    });

    return filteredMessages;
  };
