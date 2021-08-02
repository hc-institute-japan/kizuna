import { fetchUsernames } from "../../contacts/actions/fetchUsernames";
import { ThunkAction } from "../../types";
import { fetchPinnedMessages } from "./fetchPinnedMessages";
import getLatestGroupVersion from "./getLatestGroupVersion";

export const getPinnedMessages =
  (groupId: string): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    // if (state.groups.conversations[group])
    //   return state.groups.conversations[group].pinnedMessages
    //     ? state.groups.conversations[group].pinnedMessages!.map(
    //         (pinnedMessageId) => {
    //           const pinnedMessage = state.groups.messages[pinnedMessageId];

    //           return {
    //             id: pinnedMessageId,
    //             payload: pinnedMessage.payload,
    //             author: pinnedMessage.author,
    //             date: pinnedMessage.timestamp,
    //           };
    //         }
    //       )
    //     : [];
    const conversation = getState().groups.conversations[groupId];
    if (conversation) {
      const pinnedMessages = conversation.pinnedMessages;
      if (pinnedMessages) {
        const missingMessages = pinnedMessages.filter(
          (pinnedMessage) =>
            getState().groups.messages[pinnedMessage] === undefined
        );
        if (missingMessages.length === 0) {
          const authors = pinnedMessages.map((pinnedMessage) => {
            const message = getState().groups.messages[pinnedMessage];
            return message.author;
          });

          const authorProfiles = await dispatch(fetchUsernames(authors));
          console.log(authorProfiles);
        } else {
          // fetch messages here
          // dispatch()
        }
      } else dispatch(fetchPinnedMessages(groupId));
    } else dispatch(getLatestGroupVersion(groupId));
    return null;
  };
