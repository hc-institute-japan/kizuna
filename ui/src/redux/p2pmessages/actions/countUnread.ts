import { ThunkAction } from "../../types";

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
      if (latestReceipt) {
        if (latestReceipt.status !== "read" && message.author.id === conversant)
          unreadCounter = unreadCounter + 1;
      }
    });

    return unreadCounter;
  };
