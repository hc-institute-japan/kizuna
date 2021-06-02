import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { deserializeAgentPubKey } from "../../../utils/helpers";
import {
  ADD_MEMBERS, // action type
  // IO
  UpdateGroupMembersData,
  AddGroupMembersAction, // action payload type
} from "../types";
import { fetchUsernameOfMembers } from "./helpers";
import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { AgentPubKey } from "@holochain/conductor-api";

export const addGroupMembers =
  (updateGroupMembersData: UpdateGroupMembersData): ThunkAction =>
  async (
    dispatch,
    getState,
    { callZome, getAgentId }
  ): Promise<UpdateGroupMembersData> => {
    const state = getState();
    const myAgentId = await getAgentId();
    const input = {
      members: updateGroupMembersData.members.map((member: string) =>
        deserializeAgentPubKey(member)
      ),
      groupId: deserializeHash(updateGroupMembersData.groupId),
      groupRevisionId: deserializeHash(updateGroupMembersData.groupRevisionId),
    };

    console.log("this is the input to the add member", updateGroupMembersData);

    // TODO: error handling
    // TODO: input sanitation
    // Might be better to check whether there are any members duplicate in ui or hc.
    const addMembersOutput = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].ADD_MEMBERS,
      payload: input,
    });

    let membersBase64 = addMembersOutput.members.map((member: AgentPubKey) =>
      serializeHash(member)
    );

    let updateGroupMembersDataFromRes: UpdateGroupMembersData = {
      members: membersBase64,
      groupId: serializeHash(addMembersOutput.groupId),
      groupRevisionId: serializeHash(addMembersOutput.groupRevisionId),
    };

    let membersUsernames = await fetchUsernameOfMembers(
      state,
      membersBase64,
      callZome,
      serializeHash(myAgentId!)
    );

    dispatch<AddGroupMembersAction>({
      type: ADD_MEMBERS,
      updateGroupMembersData: updateGroupMembersDataFromRes,
      membersUsernames,
    });

    return updateGroupMembersData;
  };
