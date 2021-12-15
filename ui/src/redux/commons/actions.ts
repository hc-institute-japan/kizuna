import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { binaryToUrl, timestampToDate } from "../../utils/helpers";
import { SET_BLOCKED, SET_CONTACTS } from "../contacts/types";
import { pushError } from "../error/actions";
import { convertFetchedResToGroupMessagesOutput } from "../group/actions/helpers";
import {
  GroupConversation,
  GroupMessagesOutput,
  SetLatestGroupState,
  SET_LATEST_GROUP_STATE,
} from "../group/types";
import { transformZomeDataToUIData } from "../p2pmessages/actions/helpers/transformZomeDateToUIData";
import { setMessages } from "../p2pmessages/actions/setMessages";
import { SET_PREFERENCE } from "../preference/types";
import { Profile, ProfileActionTypes, SET_PROFILE } from "../profile/types";
import { ThunkAction } from "../types";

export const getLatestData =
  (): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    try {
      // TODO: error handling
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
        fields: latestData.userInfo.profile.fields.avatar
          ? { avatar: binaryToUrl(latestData.userInfo.profile.fields.avatar) }
          : {},
      });

      let contacts: { [key: string]: Profile } = {};
      let blocked: { [key: string]: Profile } = {};
      latestData.addedContacts.forEach((agentProfile: any) => {
        const agentId = serializeHash(agentProfile.agentPubKey);
        contacts[agentId] = {
          id: agentId,
          username: agentProfile.profile.nickname,
          fields: agentProfile.profile.fields.avatar
            ? {
                avatar: binaryToUrl(agentProfile.profile.fields.avatar),
              }
            : {},
        };
      });
      if (latestData.blockedContacts)
        latestData.blockedContacts.forEach((agentProfile: any) => {
          const agentId = serializeHash(agentProfile.agentPubKey);
          blocked[agentId] = {
            id: agentId,
            username: agentProfile.profile.nickname,
            fields: agentProfile.profile.fields.avatar
              ? {
                  avatar: binaryToUrl(agentProfile.profile.fields.avatar),
                }
              : {},
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
      dispatch({
        type: SET_PREFERENCE,
        preference: {
          readReceipt: latestData.globalPreference.readReceipt,
          typingIndicator: latestData.globalPreference.typingIndicator,
        },
      });

      const groupMessagesOutput: GroupMessagesOutput =
        convertFetchedResToGroupMessagesOutput(latestData.latestGroupMessages);

      const groups: GroupConversation[] = latestData.groups.map(
        (group: any): GroupConversation => ({
          originalGroupId: serializeHash(group.groupId),
          originalGroupRevisionId: serializeHash(group.groupRevisionId),
          name: group.latestName,
          members: group.members.map((id: Buffer) => serializeHash(id)),
          createdAt: timestampToDate(group.created),
          creator: serializeHash(group.creator),
          messages:
            groupMessagesOutput.messagesByGroup[serializeHash(group.groupId)],
          pinnedMessages: [],
        })
      );

      const groupMembers: Profile[] = latestData.memberProfiles.map(
        (agentProfile: any): Profile => {
          return {
            id: serializeHash(agentProfile.agentPubKey),
            username: agentProfile.profile.nickname,
            fields: agentProfile.profile.fields.avatar
              ? {
                  avatar: binaryToUrl(agentProfile.profile.fields.avatar),
                }
              : {},
          };
        }
      );

      console.log("latest groups", groups);
      console.log("latest group messages", groupMessagesOutput);
      console.log("latest group members", groupMembers);

      // let groups: GroupConversation[] = groups;
      // let groupMessagesOutput: GroupMessagesOutput = action.groupMessagesOutput;

      let conversations = getState().groups.conversations;
      groups.forEach((group: GroupConversation) => {
        conversations[group.originalGroupId] = group;
      });

      let messages = getState().groups.messages;
      messages = {
        ...messages,
        ...groupMessagesOutput.groupMessagesContents,
      };

      let members = getState().groups.members;
      groupMembers.forEach((member: Profile) => {
        members[member.id] = member;
      });

      dispatch<SetLatestGroupState>({
        type: SET_LATEST_GROUP_STATE,
        messages,
        conversations,
        members,
      });

      const contactsState = { ...getState().contacts.contacts };
      const profile = { ...getState().profile };
      const profileList = {
        ...contactsState,
        [profile.id!]: {
          id: profile.id!,
          username: profile.username!,
          fields: profile.fields,
        },
      };
      const toDispatch = transformZomeDataToUIData(
        latestData.latestP2pMessages,
        profileList
      );
      console.log("latest p2p messages", toDispatch);
      dispatch(setMessages(toDispatch));

      return null;
    } catch (e) {
      dispatch(
        pushError("TOAST", {}, { id: "redux.err.commons-get-latest-data" })
      );
    }
  };
