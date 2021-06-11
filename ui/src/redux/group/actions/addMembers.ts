import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { deserializeAgentPubKey } from "../../../utils/helpers";
import {
  ADD_MEMBERS, // action type
  // IO
  UpdateGroupMembersData,
  AddMembersAction, // action payload type
} from "../types";
import { fetchUsernameOfMembers } from "./helpers";
import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { AgentPubKey } from "@holochain/conductor-api";

export const addMembers =
  (updateGroupMembersData: UpdateGroupMembersData): ThunkAction =>
  async (
    dispatch,
    getState,
    { callZome, getAgentId, displayError }
  ): Promise<UpdateGroupMembersData> => {
    const state = getState();
    const myAgentId = await getAgentId();
    const input = {
      members: updateGroupMembersData.members
        /* dedup */
        .filter(
          (member: string, i) =>
            updateGroupMembersData.members.indexOf(member) === i
        )
        .map((member: string) => deserializeAgentPubKey(member)),
      groupId: deserializeHash(updateGroupMembersData.groupId),
      groupRevisionId: deserializeHash(updateGroupMembersData.groupRevisionId),
    };

    try {
      const addMembersOutput = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].ADD_MEMBERS,
        payload: input,
      });

      const membersBase64 = addMembersOutput.members.map(
        (member: AgentPubKey) => serializeHash(member)
      );

      const updateGroupMembersDataFromRes: UpdateGroupMembersData = {
        members: membersBase64,
        groupId: serializeHash(addMembersOutput.groupId),
        groupRevisionId: serializeHash(addMembersOutput.groupRevisionId),
      };

      const membersUsernames = await fetchUsernameOfMembers(
        state,
        membersBase64,
        callZome,
        serializeHash(myAgentId!)
      );

      dispatch<AddMembersAction>({
        type: ADD_MEMBERS,
        updateGroupMembersData: updateGroupMembersDataFromRes,
        membersUsernames,
      });

      return updateGroupMembersData;
    } catch (e) {
      switch (e.message) {
        case "members field is empty":
          return displayError(
            "TOAST",
            {},
            { id: "redux.err.group.add-members.1" }
          );
        case "cannot create group with blocked agents":
          return displayError(
            "TOAST",
            {},
            { id: "redux.err.group.add-members.2" }
          );
        case "failed to get the given group id":
          return displayError(
            "TOAST",
            {},
            { id: "redux.err.group.add-members.3" }
          );
        default:
          return displayError(
            "TOAST",
            {},
            { id: "redux.err.group.add-members.4" }
          );
      }
    }
  };
