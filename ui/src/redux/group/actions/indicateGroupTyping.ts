import { deserializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { deserializeAgentPubKey } from "../../../utils/helpers";
import { ThunkAction } from "../../types";
import { GroupTypingDetailData } from "../types";

const indicateGroupTyping =
  (groupTypingDetailData: GroupTypingDetailData): ThunkAction =>
  async (dispatch, getState, { callZome }) => {
    /* deserialize fields for zome fn */

    const input = {
      groupId: deserializeHash(groupTypingDetailData.groupId),
      indicatedBy: deserializeAgentPubKey(groupTypingDetailData.indicatedBy),
      members: groupTypingDetailData.members.map((member) =>
        deserializeAgentPubKey(member)
      ),
      isTyping: groupTypingDetailData.isTyping,
    };

    await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].INDICATE_GROUP_TYPING,
      payload: input,
    });

    return null;
  };

export default indicateGroupTyping;
