import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../utils/connection/types";
import { ThunkAction } from "../../types";
import { Profile } from "../../profile/types";
import {
  ADD_GROUP, // action type
  // IO
  CreateGroupInput,
  GroupConversation,
  AddGroupAction, // action payload type
} from "../types";
import { fetchUsernameOfMembers } from "./helpers";
import { deserializeAgentPubKey } from "../../../utils/helpers";

const createGroup =
  (createGroupInput: CreateGroupInput): ThunkAction =>
  async (
    dispatch,
    getState,
    { callZome, getAgentId }
  ): Promise<GroupConversation> => {
    const state = getState();
    const myAgentId = await getAgentId();

    const input = {
      name: createGroupInput.name,
      members: createGroupInput.members.map((member: string) =>
        deserializeAgentPubKey(member)
      ),
    };
    try {
      const createGroupRes = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].CREATE_GROUP,
        payload: input,
      });

      const groupData: GroupConversation = {
        originalGroupId: serializeHash(createGroupRes.groupId),
        originalGroupRevisionId: serializeHash(createGroupRes.groupRevisionId),
        name: createGroupRes.content.name,
        members: createGroupRes.content.members.map((member: Buffer) =>
          serializeHash(member)
        ),
        createdAt: createGroupRes.content.created,
        creator: serializeHash(createGroupRes.content.creator),
        messages: [],
        pinnedMessages: [],
        avatar: null,
      };

      const groupMembers = [...groupData.members, groupData.creator];

      const membersProfile: {
        [key: string]: Profile;
      } = await fetchUsernameOfMembers(
        state,
        groupMembers,
        callZome,
        serializeHash(myAgentId!)
      );

      let groupEntryHash: string = groupData.originalGroupId;
      let newConversation: { [key: string]: GroupConversation } = {
        [groupEntryHash]: groupData,
      };
      let conversations = state.groups.conversations;
      conversations = {
        ...conversations,
        ...newConversation,
      };
      let members = state.groups.members;
      members = {
        ...members,
        ...membersProfile,
      };

      dispatch<AddGroupAction>({
        type: ADD_GROUP,
        conversations,
        members,
      });

      return groupData;
    } catch (e) {
      /* We are throwing the error here and handle it in the caller sendInitialGroupMessage */
      throw e;
    }
  };

export default createGroup;
