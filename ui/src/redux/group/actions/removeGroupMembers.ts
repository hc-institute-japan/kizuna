import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { deserializeAgentPubKey } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import {
  REMOVE_MEMBERS, // action type
  // IO
  UpdateGroupMembersIO,
  UpdateGroupMembersData,
  RemoveGroupMembersAction, // action payload type
} from "../types";

export const removeGroupMembers =
  (updateGroupMembersData: UpdateGroupMembersData): ThunkAction =>
  async (
    dispatch,
    _getState,
    { callZome }
  ): Promise<UpdateGroupMembersData> => {
    let updateGroupMembersIO: UpdateGroupMembersIO = {
      members: updateGroupMembersData.members.map((member: string) =>
        deserializeAgentPubKey(member)
      ),
      groupId: deserializeHash(updateGroupMembersData.groupId),
      groupRevisionId: deserializeHash(updateGroupMembersData.groupRevisionId),
    };
    // TODO: error handling
    // TODO: input sanitation
    // make sure the members being removed are actual members of the group.
    const removeMembersOutput: UpdateGroupMembersIO = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].REMOVE_MEMBERS,
      payload: updateGroupMembersIO,
    });

    let updateGroupMembersDataFromRes: UpdateGroupMembersData = {
      members: removeMembersOutput.members.map((member) =>
        serializeHash(member)
      ),
      groupId: serializeHash(removeMembersOutput.groupId),
      groupRevisionId: serializeHash(removeMembersOutput.groupRevisionId),
    };

    dispatch<RemoveGroupMembersAction>({
      type: REMOVE_MEMBERS,
      updateGroupMembersData: updateGroupMembersDataFromRes,
    });

    return updateGroupMembersData;
  };
