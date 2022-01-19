import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { timestampToDate } from "../../../utils/helpers";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import {
  GroupConversation,
  GroupMessagesOutput,
  SetLatestGroupState,
  SET_LATEST_GROUP_STATE,
} from "../types";
import {
  convertFetchedResToGroupMessagesOutput,
  fetchUsernameOfMembers,
} from "./helpers";

const getLatestGroupVersion =
  (groupId: string): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    const myAgentId = await getAgentId();
    const state = getState();
    try {
      const latestGroupVersionRes = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].GET_GROUP_LATEST_VERSION,
        payload: deserializeHash(groupId),
      });

      const input = {
        groupId: deserializeHash(groupId),
        batchSize: 10,
        payloadType: {
          type: "ALL",
          payload: null,
        },
      };

      const groupMessagesRes = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].GET_PREVIOUS_GROUP_MESSAGES,
        payload: input,
      });

      const groupPinnedMessages = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].FETCH_PINNED_MESSAGES,
        payload: groupId,
      });

      const groupMessagesOutput: GroupMessagesOutput =
        convertFetchedResToGroupMessagesOutput(groupMessagesRes);

      const groupData: GroupConversation = {
        originalGroupId: serializeHash(latestGroupVersionRes.groupId),
        originalGroupRevisionId: serializeHash(
          latestGroupVersionRes.groupRevisionId
        ),
        name: latestGroupVersionRes.latestName,
        members: latestGroupVersionRes.members.map((member: any) =>
          serializeHash(member)
        ),
        createdAt: timestampToDate(latestGroupVersionRes.created),
        creator: serializeHash(latestGroupVersionRes.creator),
        messages:
          groupMessagesOutput.messagesByGroup[
            serializeHash(latestGroupVersionRes.groupId)
          ],
        pinnedMessages: Object.values(groupPinnedMessages).map((message: any) =>
          serializeHash(message.entry.messageId)
        ),
      };

      const membersUsernames = await fetchUsernameOfMembers(
        getState(),
        groupData.members,
        callZome,
        serializeHash(myAgentId!)
      );

      let conversations = state.groups.conversations;
      conversations = {
        ...conversations,
        [groupData.originalGroupId]: groupData,
      };

      let messages = state.groups.messages;
      messages = {
        ...messages,
        ...groupMessagesOutput.groupMessagesContents,
      };

      let members = state.groups.members;
      Object.keys(membersUsernames).forEach((key: string) => {
        members[key] = membersUsernames[key];
      });

      dispatch<SetLatestGroupState>({
        type: SET_LATEST_GROUP_STATE,
        conversations,
        messages,
        members,
      });

      return groupData;
    } catch (e) {
      if ((e as any)?.message?.includes("failed to get the given group id")) {
        return dispatch(
          pushError(
            "TOAST",
            {},
            { id: "redux.err.group.get-latest-group-version.1" }
          )
        );
      } else {
        return dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
      }
    }
  };

export default getLatestGroupVersion;
