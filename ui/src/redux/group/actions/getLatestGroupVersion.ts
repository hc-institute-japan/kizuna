import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { base64ToUint8Array, Uint8ArrayToBase64 } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import {
  GroupConversation,
  GroupMessageBatchFetchFilter,
  GroupMessagesOutput,
  SetLatestGroupVersionAction,
  SET_LATEST_GROUP_VERSION,
} from "../types";
import {
  convertFetchedResToGroupMessagesOutput,
  fetchUsernameOfMembers,
} from "./helpers";

export const getLatestGroupVersion =
  (groupId: string): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    const res = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].GET_GROUP_LATEST_VERSION,
      payload: {
        groupHash: base64ToUint8Array(groupId),
      },
    });
    let groupMessageBatchFetchFilter: GroupMessageBatchFetchFilter = {
      groupId: base64ToUint8Array(groupId),
      batchSize: 10,
      payloadType: {
        type: "ALL",
        payload: null,
      },
    };

    const groupMessagesRes = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].GET_NEXT_BATCH_GROUP_MESSAGES,
      payload: groupMessageBatchFetchFilter,
    });

    let groupMessagesOutput: GroupMessagesOutput =
      convertFetchedResToGroupMessagesOutput(groupMessagesRes);

    let groupData: GroupConversation = {
      originalGroupEntryHash: Uint8ArrayToBase64(res.groupId),
      originalGroupHeaderHash: Uint8ArrayToBase64(res.groupRevisionId),
      name: res.latestName,
      members: res.members.map((member: any) => Uint8ArrayToBase64(member)),
      createdAt: res.created,
      creator: Uint8ArrayToBase64(res.creator),
      messages:
        groupMessagesOutput.messagesByGroup[Uint8ArrayToBase64(res.groupId)],
    };
    let myAgentId = await getAgentId();
    let membersUsernames = await fetchUsernameOfMembers(
      getState(),
      groupData.members,
      callZome,
      Uint8ArrayToBase64(myAgentId!)
    );

    dispatch<SetLatestGroupVersionAction>({
      type: SET_LATEST_GROUP_VERSION,
      groupData,
      groupMessagesOutput,
      membersUsernames,
    });

    return groupData;
  };
