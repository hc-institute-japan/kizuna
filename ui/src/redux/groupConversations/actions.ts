import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../connection/types";
import { Uint8ArrayToBase64 } from "../../utils/helpers";
import { Profile } from "../profile/types";
import { ThunkAction } from "../types";
import {
  GroupConversation,
  GroupMessage,
  SET_CONVERSATIONS,
  SET_MESSAGES,
} from "./types";

export const createGroup = (
  name: string,
  members: Profile[]
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  // const res = await callZome({
  //   zomeName: ZOMES.GROUP,
  //   fnName: FUNCTIONS[ZOMES.GROUP].CREATE_GROUP,
  //   payload: {
  //     name,
  //     members: members.map((member) => member.id),
  //   },
  // });
  // return res;
};

export const sendGroupMessage = (
  groupId: Uint8Array,
  payload: any,
  sender: AgentPubKey,
  replyTo = null
): ThunkAction => async (dispatch, _getState, { callZome }) => {
  // const res = await callZome({
  //   zomeName: ZOMES.GROUP,
  //   fnName: FUNCTIONS[ZOMES.GROUP].SEND_MESSAGE,
  //   payload: {
  //     group_hash: groupId,
  //     payload_input: payload,p
  //     sender,
  //     replyTo,
  //   },
  // });
};
