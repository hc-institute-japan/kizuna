import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { deserializeAgentPubKey } from "../../../utils/helpers";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import {
  AddMembersAction,
  ADD_MEMBERS,

  // IO
  UpdateGroupMembersData,
} from "../types";
import { fetchUsernameOfMembers } from "./helpers";

export const addMembers =
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

      dispatch<AddMembersAction>({
        type: ADD_MEMBERS,
        updateGroupMembersData: updateGroupMembersDataFromRes,
        membersUsernames,
      });

      return updateGroupMembersData;
    } catch (e) {
      switch (e.message) {
        case "members field is empty":
          dispatch(
            pushError(
              "TOAST",
              { duration: 2000 },
              { id: "redux.err.group.add-members.1" }
            )
          );
          return false;
        case "cannot create group with blocked agents":
          dispatch(
            pushError(
              "TOAST",
              { duration: 1600 },
              { id: "redux.err.group.add-members.2" }
            )
          );
          return false;
        case "failed to get the given group id":
          dispatch(
            pushError(
              "TOAST",
              { duration: 2000 },
              { id: "redux.err.group.add-members.3" }
            )
          );
          return false;
        default:
          dispatch(
            pushError("TOAST", { duration: 1000 }, { id: "redux.err.generic" })
          );
          return false;
      }
    }
  };
