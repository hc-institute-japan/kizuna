import { FUNCTIONS, ZOMES } from "../../../connection/types";
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
      const conversation = getState().groups.conversations[groupId];
      const pinnedMessages = getState().groups.pinnedMessages;

      delete pinnedMessages[groupMessageId];

      conversation.pinnedMessages = conversation.pinnedMessages
        ? conversation.pinnedMessages!.filter(
            (pinnedMessage) => pinnedMessage !== groupMessageId
          )
        : [];

      dispatch<SetPinnedMessages>({
        type: SET_PINNED_MESSAGES,
        conversations: {
          ...getState().groups.conversations,
          [groupId]: conversation,
        },
        pinnedMessages,
      });
    } catch (e) {
      return dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
