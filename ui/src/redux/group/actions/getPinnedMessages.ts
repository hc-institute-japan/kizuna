import { serializeHash } from "@holochain-open-dev/core-types";
import { ThunkAction } from "../../types";
import { fetchPinnedMessages } from "./fetchPinnedMessages";
import getLatestGroupVersion from "./getLatestGroupVersion";
import { fetchUsernameOfMembers } from "./helpers";

export const getPinnedMessages =
  (groupId: string): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    const conversation = getState().groups.conversations[groupId];
    if (conversation) {
      const pinnedMessages = conversation.pinnedMessages;
      if (
        pinnedMessages &&
        pinnedMessages.filter(
          (pinnedMessage) =>
            getState().groups.pinnedMessages[pinnedMessage] === undefined
        ).length === 0
      ) {
        const authors = pinnedMessages.map((pinnedMessage) => {
          const message = getState().groups.messages[pinnedMessage];
          return message.author;
        });
        const id = await getAgentId();

        if (id) {
          const authorProfiles = await fetchUsernameOfMembers(
            getState(),
            authors,
            callZome,
            serializeHash(id)
          );

          return pinnedMessages.map((messageId) => {
            const message = getState().groups.pinnedMessages[messageId];
            const author = authorProfiles[message.author];

            return {
              id: message.groupMessageId,
              payload: message.payload,
              author: author ? author.username : message.author,
              date: message.timestamp,
            };
          });
        }

        // fetch messages here
        // dispatch()
      } else dispatch(fetchPinnedMessages(groupId));
    } else dispatch(getLatestGroupVersion(groupId));

    return null;
  };
