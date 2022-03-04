import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import {
  FUNCTIONS,
  ZOMES,
} from "../../../utils/services/HolochainService/types";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import {
  GroupConversation,
  // action payload types
  UpdateGroupAvatarAction,
  // IO
  UpdateGroupAvatarData,
  // action types
  UPDATE_GROUP_AVATAR,
} from "../types";

const updateGroupAvatar =
  (updateGroupAvatarData: UpdateGroupAvatarData): ThunkAction =>
  async (dispatch, getState, { callZome }): Promise<UpdateGroupAvatarData> => {
    const state = getState();
    const group = state.groups.conversations[updateGroupAvatarData.groupId];

    /* return err right away if the group name is the same as the old one */
    if (group.avatar === updateGroupAvatarData.avatar) {
      return dispatch(
        pushError("TOAST", {}, { id: "redux.err.group.update-group-name.1" })
      );
    }

    /* deserialize fields for zome fn */
    const input = {
      avatar: updateGroupAvatarData.avatar,
      groupId: deserializeHash(updateGroupAvatarData.groupId),
      groupRevisionId: deserializeHash(updateGroupAvatarData.groupRevisionId),
    };

    try {
      const updateGroupAvatarOutput = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].UPDATE_GROUP_AVATAR,
        payload: input,
      });

      /* serializeHash returned value from zome fn */
      const updateGroupNameDataFromRes: UpdateGroupAvatarData = {
        avatar: updateGroupAvatarOutput.avatar,
        groupId: serializeHash(updateGroupAvatarOutput.groupId),
        groupRevisionId: serializeHash(updateGroupAvatarOutput.groupRevisionId),
      };

      const groupEntryHash: string = updateGroupNameDataFromRes.groupId;
      const groupConversation: GroupConversation =
        state.groups.conversations[groupEntryHash];
      groupConversation.avatar = updateGroupNameDataFromRes.avatar;
      let conversations = state.groups.conversations;
      conversations = {
        ...conversations,
        [groupEntryHash]: groupConversation,
      };

      dispatch<UpdateGroupAvatarAction>({
        type: UPDATE_GROUP_AVATAR,
        conversations,
      });

      return updateGroupAvatarData;
    } catch (e) {
      switch (true) {
        case (e as any).message.includes("failed to get the given group id"):
          return dispatch(
            pushError(
              "TOAST",
              {},
              { id: "redux.err.group.update-group-name.2" }
            )
          );
        case (e as any).message.includes(
          "the group name must be 1 to 50 characters length"
        ):
          return dispatch(
            pushError(
              "TOAST",
              {},
              { id: "redux.err.group.update-group-name.3" }
            )
          );
        case (e as any).message.includes(
          "cannot update a group entry if you are not the group creator (admin)"
        ):
          return dispatch(
            pushError(
              "TOAST",
              {},
              { id: "redux.err.group.update-group-name.4" }
            )
          );
        default:
          return dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
      }
    }
  };

export default updateGroupAvatar;
