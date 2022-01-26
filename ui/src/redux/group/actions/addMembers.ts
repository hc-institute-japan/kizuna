import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { deserializeAgentPubKey } from "../../../utils/helpers";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import {
  AddMembersAction,
  ADD_MEMBERS,
  GroupConversation,

  // IO
  UpdateGroupMembersData,
} from "../types";
import { fetchUsernameOfMembers } from "./helpers";

const addMembers =
  (updateGroupMembersData: UpdateGroupMembersData): ThunkAction =>
  async (
    dispatch,
    getState,
    { callZome, getAgentId }
  ): Promise<UpdateGroupMembersData | boolean> => {
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

      let groupEntryHash: string = updateGroupMembersDataFromRes.groupId;
      let groupConversation: GroupConversation =
        state.groups.conversations[groupEntryHash];
      groupConversation.members = groupConversation.members.concat(
        updateGroupMembersDataFromRes.members
      );
      let conversations = state.groups.conversations;
      conversations = {
        ...conversations,
        [groupEntryHash]: groupConversation,
      };
      let members = state.groups.members;
      members = {
        ...members,
        ...membersUsernames,
      };

      dispatch<AddMembersAction>({
        type: ADD_MEMBERS,
        conversations,
        members,
      });

      return updateGroupMembersData;
    } catch (e) {
      switch (true) {
        case (e as any).message.includes("members field is empty"):
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.add-members.1" })
          );
          return false;
        case (e as any).message.includes(
          "cannot create group with blocked agents"
        ):
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.add-members.2" })
          );
          return false;
        case (e as any).message.includes("failed to get the given group id"):
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.add-members.3" })
          );
          return false;
        case (e as any).message.includes(
          "cannot update a group entry if you are not the group creator (admin)"
        ):
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.add-members.4" })
          );
          return false;
        case (e as any).message.includes(
          "creator AgentPubKey cannot be included in the group members list"
        ):
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.add-members.5" })
          );
          return false;
        default:
          dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
          return false;
      }
    }
  };

export default addMembers;
