import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { Uint8ArrayToBase64 } from "../../../utils/helpers";
import { Profile } from "../../profile/types";
import {
  ADD_GROUP, // action type
  // IO
  CreateGroupInput,
  GroupConversation,
  AddGroupAction, // action payload type
} from "../types";
import { fetchUsernameOfMembers } from "./helpers";

export const createGroup =
  (createGroupInput: CreateGroupInput): ThunkAction =>
  async (
    dispatch,
    getState,
    { callZome, getAgentId }
  ): Promise<GroupConversation> => {
    // TODO: error handling
    // TODO: input sanitation
    const createGroupRes = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].CREATE_GROUP,
      payload: createGroupInput,
    });

    let groupData: GroupConversation = {
      originalGroupEntryHash: Uint8ArrayToBase64(createGroupRes.groupId),
      originalGroupHeaderHash: Uint8ArrayToBase64(
        createGroupRes.groupRevisionId
      ),
      name: createGroupRes.content.name,
      members: createGroupRes.content.members.map((member: Buffer) =>
        Uint8ArrayToBase64(member)
      ),
      createdAt: createGroupRes.content.created,
      creator: Uint8ArrayToBase64(createGroupRes.content.creator),
      messages: [],
    };

    let state = getState();
    let myAgentId = await getAgentId();
    let groupMembers = [...groupData.members, groupData.creator];

    let membersProfile: {
      [key: string]: Profile;
    } = await fetchUsernameOfMembers(
      state,
      groupMembers,
      callZome,
      Uint8ArrayToBase64(myAgentId!)
    );

    dispatch<AddGroupAction>({
      type: ADD_GROUP,
      groupData,
      membersProfile,
    });

    return groupData;
  };
