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
import retryCommitReceipt from "../p2pmessages/actions/signals/retryCommitReceipt";
import { RootState } from "../types";
import retryReceiveMessage from "../p2pmessages/actions/signals/retryReceiveMessage";

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
      case SIGNALS[ZOMES.P2PMESSAGE].P2P_RETRY_RECEIVE_MESSAGE:
        console.log("ui signal received to retry receive message");
        dispatch(retryReceiveMessage(payload));
        break;
      case SIGNALS[ZOMES.P2PMESSAGE].P2P_RETRY_DELIVERED_RECEIPT:
        console.log("ui signal received to retry delivered receipt");
        dispatch(retryCommitReceipt(payload));
        break;
      case SIGNALS[ZOMES.P2PMESSAGE].P2P_RETRY_READ_RECEIPT:
        console.log("ui signal received to retry read receipt");
      // dispatch(retryCommitReceipt(payload));
    }
  };
