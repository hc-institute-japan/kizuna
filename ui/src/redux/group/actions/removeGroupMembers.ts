import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { Uint8ArrayToBase64, base64ToUint8Array } from "../../../utils/helpers";
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
        Buffer.from(base64ToUint8Array(member).buffer)
      ),
      groupId: base64ToUint8Array(updateGroupMembersData.groupId),
      groupRevisionId: base64ToUint8Array(
        updateGroupMembersData.groupRevisionId
      ),
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
        Uint8ArrayToBase64(member)
      ),
      groupId: Uint8ArrayToBase64(removeMembersOutput.groupId),
      groupRevisionId: Uint8ArrayToBase64(removeMembersOutput.groupRevisionId),
    };

    dispatch<RemoveGroupMembersAction>({
      type: REMOVE_MEMBERS,
      updateGroupMembersData: updateGroupMembersDataFromRes,
    });

    return updateGroupMembersData;
  };
