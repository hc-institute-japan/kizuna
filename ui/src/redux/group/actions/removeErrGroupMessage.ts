import { ThunkAction } from "../../types";
import {
  GroupMessageBundle,
  SetGroupErrMessageAction,
  SET_ERR_GROUP_MESSAGE,
} from "../types";

const removeErrGroupMessage =
  (message: GroupMessageBundle): ThunkAction =>
  async (dispatch, getState) => {
    if (message.err) {
      const groups = getState().groups;
      let groupErrMessages = groups.errMsgs[message.groupId]
        ? groups.errMsgs[message.groupId]
        : [];

      const stringified = groupErrMessages.map((errMsg) =>
        JSON.stringify(errMsg)
      );
      const i = stringified.indexOf(JSON.stringify(message));
      if (i > -1) groupErrMessages.splice(i, 1);
      dispatch<SetGroupErrMessageAction>({
        type: SET_ERR_GROUP_MESSAGE,
        errMsgs: { ...groups.errMsgs, [message.groupId]: groupErrMessages },
      });
    }
  };

export default removeErrGroupMessage;
