import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import Search from "../../../components/Search";
import { Payload } from "../../../redux/commons/types";
import { getMessagesByGroupByTimestamp } from "../../../redux/group/actions";
import fetchMembers from "../../../redux/group/actions/fetchMembers";
import { GroupMessagesOutput } from "../../../redux/group/types";
import { Profile } from "../../../redux/profile/types";
import { RootState } from "../../../redux/types";
import { useAppDispatch } from "../../../utils/helpers";

const GroupSearch: React.FC = () => {
  const [messages, setMessages] = useState<
    {
      id: string;
      author: Profile;
      payload: Payload;
      timestamp: Date;
      readList: any;
    }[]
  >();

  const { group } = useParams<{ group: string }>();
  const { id } = useSelector((state: RootState) => state.profile);

  const dispatch = useAppDispatch();

  return (
    <Search
      messages={messages}
      onDateSelect={(date) => {
        dispatch(
          getMessagesByGroupByTimestamp({
            groupId: group,
            date,
            payloadType: { type: "ALL", payload: null },
          })
        ).then((messages: GroupMessagesOutput) => {
          const msgs = messages.messagesByGroup[group].map((id: any) => {
            const content = messages.groupMessagesContents[id];

            return {
              id: content.groupId,
              author: {
                id: content.author,
              },
              timestamp: content.timestamp,
              payload: content.payload,
              readList: content.readList,
              replyTo: content.replyTo,
            };
          });
          dispatch(
            fetchMembers(
              msgs.map((msg) => msg.author.id),
              id!
            )
          ).then((profiles: { [key: string]: Profile }) => {
            setMessages(
              msgs.map((msg) => ({
                ...msg,
                author: { ...profiles[msg.author.id] },
              }))
            );
          });
        });
      }}
      prevHref={`/g/${group}`}
      type="group"
    ></Search>
  );
};

export default GroupSearch;
