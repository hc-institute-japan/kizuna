import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { Uint8ArrayToBase64, base64ToUint8Array } from "../../../utils/helpers";
import {
  ADD_MEMBERS, // action type
  // IO
  UpdateGroupMembersIO,
  UpdateGroupMembersData,
  AddGroupMembersAction, // action payload type
} from "../types";
import { fetchUsernameOfMembers } from "./helpers";

export const addGroupMembers =
  (updateGroupMembersData: UpdateGroupMembersData): ThunkAction =>
  async (
    dispatch,
    getState,
    { callZome, getAgentId }
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
    // Might be better to check whether there are any members duplicate in ui or hc.
    const addMembersOutput: UpdateGroupMembersIO = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].ADD_MEMBERS,
      payload: updateGroupMembersIO,
    });

    let membersBase64 = addMembersOutput.members.map((member) =>
      Uint8ArrayToBase64(member)
    );

    let updateGroupMembersDataFromRes: UpdateGroupMembersData = {
      members: membersBase64,
      groupId: Uint8ArrayToBase64(addMembersOutput.groupId),
      groupRevisionId: Uint8ArrayToBase64(addMembersOutput.groupRevisionId),
    };

    let state = getState();
    let myAgentId = await getAgentId();
    let membersUsernames = await fetchUsernameOfMembers(
      state,
      membersBase64,
      callZome,
      Uint8ArrayToBase64(myAgentId!)
    );

    dispatch<AddGroupMembersAction>({
      type: ADD_MEMBERS,
      updateGroupMembersData: updateGroupMembersDataFromRes,
      membersUsernames,
    });

    return updateGroupMembersData;
  };
