import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import {
  // action types
  UPDATE_GROUP_NAME,
  // IO
  UpdateGroupNameData,
  // action payload types
  UpdateGroupNameAction,
} from "../types";

export const updateGroupName =
  (updateGroupNameData: UpdateGroupNameData): ThunkAction =>
  async (dispatch, _getState, { callZome }): Promise<UpdateGroupNameData> => {
    /* deserialize fields for zome fn */
    const input = {
      name: updateGroupNameData.name,
      groupId: deserializeHash(updateGroupNameData.groupId),
      groupRevisionId: deserializeHash(updateGroupNameData.groupRevisionId),
    };
    // TODO: error handling
    // TODO: input sanitation
    const updateGroupNameOutput = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].UPDATE_GROUP_NAME,
      payload: input,
    });

    /* serializeHash returned value from zome fn */
    let updateGroupNameDataFromRes: UpdateGroupNameData = {
      name: updateGroupNameOutput.name,
      groupId: serializeHash(updateGroupNameOutput.groupId),
      groupRevisionId: serializeHash(updateGroupNameOutput.groupRevisionId),
    };

    dispatch<UpdateGroupNameAction>({
      type: UPDATE_GROUP_NAME,
      updateGroupNameData: updateGroupNameDataFromRes,
    });

    return updateGroupNameData;
  };
