import { FUNCTIONS, ZOMES } from "../../connection/types";
import { Uint8ArrayToBase64 } from "../../utils/helpers";
import { SET_BLOCKED, SET_CONTACTS } from "../contacts/types";
import {
  GroupConversation,
  GroupMessagesOutput,
  SetLatestGroupState,
  SET_LATEST_GROUP_STATE,
} from "../group/types";
import { convertFetchedResToGroupMessagesOutput } from "../group/actions";
import { SET_PREFERENCE } from "../preference/types";
import { Profile, SET_USERNAME } from "../profile/types";
import { ThunkAction } from "../types";
import { getLatestMessages } from "../p2pmessages/actions";

export const getLatestData = (): ThunkAction => async (
  dispatch,
  _getState,
  { callZome, getAgentId }
) => {
  // TODO: error handling
  // TODO: input sanitation
  const latestData = await callZome({
    zomeName: ZOMES.AGGREGATOR,
    fnName: FUNCTIONS[ZOMES.AGGREGATOR].RETRIEVE_LATEST_DATA,
  });

  dispatch({
    type: SET_USERNAME,
    username: latestData.userInfo.username,
  });

  let contacts: { [key: string]: Profile } = {};
  let blocked: { [key: string]: Profile } = {};
  latestData.addedContacts.forEach((profile: any) => {
    const base64 = Uint8ArrayToBase64(profile.agentId);
    contacts[base64] = {
      id: base64,
      username: profile.username,
    };
  });
  latestData.blockedContacts.forEach((profile: any) => {
    const base64 = Uint8ArrayToBase64(profile.agentId);
    blocked[base64] = {
      id: base64,
      username: profile.username,
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

  let groupMessagesOutput: GroupMessagesOutput = convertFetchedResToGroupMessagesOutput(
    latestData.latestGroupMessages
  );

  let groups: GroupConversation[] = latestData.groups.map(
    (group: any): GroupConversation => {
      return {
        originalGroupEntryHash: Uint8ArrayToBase64(group.groupId),
        originalGroupHeaderHash: Uint8ArrayToBase64(group.groupRevisionId),
        name: group.latestName,
        members: group.members.map((id: Buffer) => Uint8ArrayToBase64(id)),
        createdAt: group.created,
        creator: Uint8ArrayToBase64(group.creator),
        messages:
          groupMessagesOutput.messagesByGroup[
            Uint8ArrayToBase64(group.groupId)
          ],
      };
    }
  );

  let members: Profile[] = latestData.memberProfiles.map(
    (profile: any): Profile => {
      return {
        id: Uint8ArrayToBase64(profile.agentId),
        username: profile.username,
      };
    }
  );

  dispatch<SetLatestGroupState>({
    type: SET_LATEST_GROUP_STATE,
    groups,
    groupMessagesOutput,
    members,
  });

  dispatch(getLatestMessages(20));

  return null;
};
