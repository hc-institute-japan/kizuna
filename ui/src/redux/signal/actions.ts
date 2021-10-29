import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { SIGNALS, ZOMES } from "../../connection/types";
import addedToGroup from "../group/actions/signals/addedToGroup";
import groupMessageData from "../group/actions/signals/groupMessageData";
import groupMessageRead from "../group/actions/signals/groupMessageRead";
import groupTypingDetail from "../group/actions/signals/groupTypingDetail";
import receiveP2PMessage from "../p2pmessages/actions/signals/receiveP2PMessage";
import receiveP2PReceipt from "../p2pmessages/actions/signals/receiveP2PReceipt";
import receiveP2PPin from "../p2pmessages/actions/signals/receiveP2PPin";
import typingP2P from "../p2pmessages/actions/signals/typingP2P";
import recommitMessage from "../p2pmessages/actions/signals/recommitMessage";
import { RootState } from "../types";

export const handleSignal =
  (type: string, payload: any): any =>
  async (dispatch: ThunkDispatch<RootState, any, AnyAction>) => {
    switch (type) {
      case SIGNALS[ZOMES.GROUP].ADDED_TO_GROUP:
        dispatch(addedToGroup(payload));
        break;
      case SIGNALS[ZOMES.GROUP].GROUP_MESSAGE_DATA:
        dispatch(groupMessageData(payload));
        break;
      case SIGNALS[ZOMES.GROUP].GROUP_TYPING_DETAIL:
        dispatch(groupTypingDetail(payload));
        break;
      case SIGNALS[ZOMES.GROUP].GROUP_MESSAGE_READ:
        dispatch(groupMessageRead(payload));
        break;
      case SIGNALS[ZOMES.P2PMESSAGE].RECEIVE_P2P_MESSAGE:
        dispatch(receiveP2PMessage(payload));
        break;
      case SIGNALS[ZOMES.P2PMESSAGE].RECEIVE_P2P_RECEIPT:
        dispatch(receiveP2PReceipt(payload));
        break;
      case SIGNALS[ZOMES.P2PMESSAGE].TYPING_P2P:
        dispatch(typingP2P(payload));
        break;
      case SIGNALS[ZOMES.P2PMESSAGE].SYNC_P2P_PINS:
        dispatch(receiveP2PPin(payload));
        break;
      case SIGNALS[ZOMES.P2PMESSAGE].POST_COMMIT_ERROR_COMMIT_MESSAGE:
        dispatch(recommitMessage(payload));
        break;
    }
  };
