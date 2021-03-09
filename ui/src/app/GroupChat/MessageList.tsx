import React from "react";
import { useSelector } from "react-redux";
import Me from "../../components/Me";
import Others from "../../components/Others";
import { fetchId } from "../../redux/profile/actions";
import { RootState } from "../../redux/types";
import { Uint8ArrayToBase64, useAppDispatch } from "../../utils/helpers";
import styles from "./style.module.css";
interface Props {
  messageIds: string[];
}
const MessageList: React.FC<Props> = ({ messageIds }) => {
  const dispatch = useAppDispatch();
  const { id } = useSelector((state: RootState) => state.profile);
  const messages = useSelector((state: RootState) => {
    const messages: (any | undefined)[] = messageIds.map((messageId) => {
      let message = state.groupConversations.messages[messageId];
      let profile = null;
      if (message) {
        if (state.profile.id)
          if (
            Uint8ArrayToBase64(state.profile.id) ===
            Uint8ArrayToBase64(message.author)
          )
            profile = state.profile;
          else dispatch(fetchId());

        return {
          ...message,
          author: profile
            ? profile
            : state.contacts.contacts[Uint8ArrayToBase64(message.author)],
        };
      }
      return null;
    });
    if (messages.find((message) => message === null)) return messages;
    return null;
    // handle fetching of missing messages
  });

  return (
    <div className={`${styles.chat} ion-padding`}>
      {messages
        ? messages.map((message) => {
            let Message =
              JSON.stringify(message.author) === JSON.stringify(id)
                ? Me
                : Others;
            return (
              <Message key={message.groupEntryHash} message={message.payload} />
            );
          })
        : null}
    </div>
  );
};

export default MessageList;
