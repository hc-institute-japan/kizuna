import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import {
  // action types
  UPDATE_GROUP_NAME,
  // IO
  UpdateGroupNameIO,
  UpdateGroupNameData,
  // action payload types
  UpdateGroupNameAction,
} from "../types";

export const updateGroupName =
  (updateGroupNameData: UpdateGroupNameData): ThunkAction =>
  async (dispatch, _getState, { callZome }): Promise<UpdateGroupNameData> => {
    let updateGroupNameIO: UpdateGroupNameIO = {
      name: updateGroupNameData.name,
      groupId: deserializeHash(updateGroupNameData.groupId),
      groupRevisionId: deserializeHash(updateGroupNameData.groupRevisionId),
    };
    // TODO: error handling
    // TODO: input sanitation
    const updateGroupNameOutput: UpdateGroupNameIO = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].UPDATE_GROUP_NAME,
      payload: updateGroupNameIO,
    });

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
