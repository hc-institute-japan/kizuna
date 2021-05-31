import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
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

export const createGroup =
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
      ), // deserialize to AgentPubKey
    };
    // TODO: error handling
    // TODO: input sanitation
    const createGroupRes = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].CREATE_GROUP,
      payload: input,
    });

    let groupData: GroupConversation = {
      originalGroupId: serializeHash(createGroupRes.groupId),
      originalGroupRevisionId: serializeHash(createGroupRes.groupRevisionId),
      name: createGroupRes.content.name,
      members: createGroupRes.content.members.map((member: Buffer) =>
        serializeHash(member)
      ),
      createdAt: createGroupRes.content.created,
      creator: serializeHash(createGroupRes.content.creator),
      messages: [],
    };

    let groupMembers = [...groupData.members, groupData.creator];

    let membersProfile: {
      [key: string]: Profile;
    } = await fetchUsernameOfMembers(
      state,
      groupMembers,
      callZome,
      serializeHash(myAgentId!)
    );

    dispatch<AddGroupAction>({
      type: ADD_GROUP,
      groupData,
      membersProfile,
    });

    return groupData;
  };
