import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { ThunkAction } from "../../types";
import { Uint8ArrayToBase64, base64ToUint8Array } from "../../../utils/helpers";
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
      groupId: base64ToUint8Array(updateGroupNameData.groupId),
      groupRevisionId: base64ToUint8Array(updateGroupNameData.groupRevisionId),
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
      groupId: Uint8ArrayToBase64(updateGroupNameOutput.groupId),
      groupRevisionId: Uint8ArrayToBase64(
        updateGroupNameOutput.groupRevisionId
      ),
    };

    dispatch<UpdateGroupNameAction>({
      type: UPDATE_GROUP_NAME,
      updateGroupNameData: updateGroupNameDataFromRes,
    });

    return updateGroupNameData;
  };
