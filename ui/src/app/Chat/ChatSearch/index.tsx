import React, { useState } from "react";
import { useParams } from "react-router";
import Search from "../../../components/Search";
import { Payload } from "../../../redux/commons/types";
import { getMessagesByAgentByTimestamp } from "../../../redux/p2pmessages/actions/getMessagesByAgentByTimestamp";
import {
  P2PMessage,
  P2PMessageConversationState,
} from "../../../redux/p2pmessages/types";
import { Profile } from "../../../redux/profile/types";
import { useAppDispatch } from "../../../utils/services/ReduxService";

const ChatSearch: React.FC = () => {
  const [messages, setMessages] = useState<
    {
      id: string;
      author: Profile;
      payload: Payload;
      timestamp: Date;
      readList: any;
    }[]
  >();

  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();

  return (
    <Search
      type="p2p"
      messages={messages}
      onDateSelect={(date) => {
        dispatch(getMessagesByAgentByTimestamp(id, date, "All")).then(
          (searchResults: P2PMessageConversationState) => {
            const msgs = Object.values(searchResults.messages).map(
              (message: P2PMessage) => {
                let receiptIDs = message.receipts;
                let filteredReceipts = receiptIDs.map((id) => {
                  let receipt = searchResults.receipts[id];
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

                let readlist =
                  latestReceipt.status === "read"
                    ? { key: latestReceipt.timestamp }
                    : {};

                return {
                  id: message.p2pMessageEntryHash,
                  author: message.author,
                  payload: message.payload,
                  timestamp: message.timestamp,
                  readList: readlist,
                };
              }
            );
            setMessages(msgs.reverse());
          }
        );
      }}
      prevHref={`/u/${id}`}
    ></Search>
  );
};

export default ChatSearch;
