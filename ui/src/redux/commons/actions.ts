import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { timestampToDate } from "../../utils/helpers";
import { SET_BLOCKED, SET_CONTACTS } from "../contacts/types";
import { convertFetchedResToGroupMessagesOutput } from "../group/actions/helpers";
import {
  GroupConversation,
  GroupMessagesOutput,
  SetLatestGroupState,
  SET_LATEST_GROUP_STATE,
} from "../group/types";
import { getLatestMessages } from "../p2pmessages/actions";
import { Profile, ProfileActionTypes, SET_PROFILE } from "../profile/types";
import { ThunkAction } from "../types";

export const getLatestData =
  (): ThunkAction =>
  async (dispatch, _getState, { callZome, getAgentId }) => {
    // TODO: error handling
    // TODO: input sanitation
    const latestData = await callZome({
      zomeName: ZOMES.AGGREGATOR,
      fnName: FUNCTIONS[ZOMES.AGGREGATOR].RETRIEVE_LATEST_DATA,
    });

    const myAgentId = await getAgentId();
    /* assume that getAgentId() is non-nullable */
    const myAgentIdB64 = serializeHash(myAgentId!);

    dispatch<ProfileActionTypes>({
      type: SET_PROFILE,
      id: myAgentIdB64,
      nickname: latestData.userInfo.profile.nickname,
    });

    let contacts: { [key: string]: Profile } = {};
    let blocked: { [key: string]: Profile } = {};
    latestData.addedContacts.forEach((agentProfile: any) => {
      const agentId = agentProfile.agentPubKey;
      contacts[agentId] = {
        id: agentId,
        username: agentProfile.profile.nickname,
      };
    });
    latestData.blockedContacts.forEach((agentProfile: any) => {
      const agentId = agentProfile.agentPubKey;
      blocked[agentId] = {
        id: agentId,
        username: agentProfile.profile.nickname,
      };
    });

    dispatch({
      type: SET_CONTACTS,
      contacts,
    });

    dispatch({
      type: SET_BLOCKED,
      blocked,
    });

    // TODO: store per agent and group prefenrece as well
    // dispatch({
    //   type: SET_PREFERENCE,
    //   preference: {
    //     readReceipt: latestData.globalPreference.readReceipt,
    //     typingIndicator: latestData.globalPreference.typingIndicator,
    //   },
    // });

    const groupMessagesOutput: GroupMessagesOutput =
      convertFetchedResToGroupMessagesOutput(latestData.latestGroupMessages);

    let groups: GroupConversation[] = latestData.groups.map(
      (group: any): GroupConversation => {
        return {
          originalGroupId: serializeHash(group.groupId),
          originalGroupRevisionId: serializeHash(group.groupRevisionId),
          name: group.latestName,
          members: group.members.map((id: Buffer) => serializeHash(id)),
          createdAt: timestampToDate(group.created),
          creator: serializeHash(group.creator),
          messages:
            groupMessagesOutput.messagesByGroup[serializeHash(group.groupId)],
        };
      }
    );

    let members: Profile[] = latestData.memberProfiles.map(
      (agentProfile: any): Profile => {
        return {
          id: agentProfile.agentPubKey,
          username: agentProfile.profile.nickname,
        };
      }
    );

    dispatch<SetLatestGroupState>({
      type: SET_LATEST_GROUP_STATE,
      groups,
      groupMessagesOutput,
      members,
    });

    dispatch(getLatestMessages(21));

    return null;
  };
