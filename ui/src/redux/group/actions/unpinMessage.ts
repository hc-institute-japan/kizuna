import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import { SetPinnedMessages, SET_PINNED_MESSAGES } from "../types";

export const unpinMessage =
  (groupId: string, groupMessageId: string): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    try {
      await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].UNPIN_MESSAGE,
        payload: {
          groupHash: groupId,
          groupMessageHash: groupMessageId,
        },
      });
      const { conversations, pinnedMessages } = {
        ...{
          conversations: getState().groups.conversations,
          pinnedMessages: getState().groups.pinnedMessages,
        },
      };
      const conversation = conversations[groupId];

      const { [groupMessageId]: _, ...newPinnedMessages } = pinnedMessages;

      conversation.pinnedMessages = conversation.pinnedMessages
        ? conversation.pinnedMessages!.filter(
            (pinnedMessage) => pinnedMessage !== groupMessageId
          )
        : [];

      dispatch<SetPinnedMessages>({
        type: SET_PINNED_MESSAGES,
        conversations: {
          ...conversations,
          [groupId]: conversation,
        },
        pinnedMessages: newPinnedMessages,
      });
    } catch (e) {
      return dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
