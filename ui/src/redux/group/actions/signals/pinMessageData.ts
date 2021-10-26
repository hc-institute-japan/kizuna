import { ThunkAction } from "../../../types";
import { serializeHash } from "@holochain-open-dev/core-types";
import { SetPinnedMessages, SET_PINNED_MESSAGES } from "../../types";

const pinMessageData =
  (signalPayload: any): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    const { payload } = signalPayload;
    const groupId = serializeHash(payload.groupHash);
    const groupMessageId = serializeHash(payload.groupMessageHash);
    const { conversations, pinnedMessages, message } = {
      ...{
        pinnedMessages: getState().groups.pinnedMessages,
        message: getState().groups.messages[groupMessageId],
        conversations: getState().groups.conversations,
      },
    };

    const conversation = conversations[groupId];
    pinnedMessages[groupMessageId] = message;
    if (conversation.pinnedMessages)
      conversation.pinnedMessages!.push(groupMessageId);
    else conversation.pinnedMessages = [groupMessageId];

    dispatch<SetPinnedMessages>({
      type: SET_PINNED_MESSAGES,
      conversations: {
        ...conversations,
        [groupId]: conversation,
      },
      pinnedMessages: {
        ...getState().groups.pinnedMessages,
        ...pinnedMessages,
      },
    });
  };

export default pinMessageData;
