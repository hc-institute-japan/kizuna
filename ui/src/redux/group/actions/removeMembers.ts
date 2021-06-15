import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { deserializeAgentPubKey } from "../../../utils/helpers";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import {
  RemoveMembersAction,
  REMOVE_MEMBERS,

  // IO
  UpdateGroupMembersData,
} from "../types";

export const removeMembers =
  (updateGroupMembersData: UpdateGroupMembersData): ThunkAction =>
  async (
    dispatch,
    _getState,
    { callZome }
  ): Promise<UpdateGroupMembersData | false> => {
    const input = {
      members: updateGroupMembersData.members.map((member: string) =>
        deserializeAgentPubKey(member)
      ),
      groupId: deserializeHash(updateGroupMembersData.groupId),
      groupRevisionId: deserializeHash(updateGroupMembersData.groupRevisionId),
    };

    try {
      const removeMembersOutput = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].REMOVE_MEMBERS,
        payload: input,
      });

      const updateGroupMembersDataFromRes: UpdateGroupMembersData = {
        members: removeMembersOutput.members.map((member: AgentPubKey) =>
          serializeHash(member)
        ),
        groupId: serializeHash(removeMembersOutput.groupId),
        groupRevisionId: serializeHash(removeMembersOutput.groupRevisionId),
      };

      dispatch<RemoveMembersAction>({
        type: REMOVE_MEMBERS,
        updateGroupMembersData: updateGroupMembersDataFromRes,
      });

      return updateGroupMembersData;
    } catch (e) {
      switch (e.message) {
        case "members field is empty":
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.remove-members.1" })
          );
          return false;
        case "failed to get the given group id":
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.remove-members.2" })
          );
          return false;
        default:
          dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
          return false;
      }
    }
  };
