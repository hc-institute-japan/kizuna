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

export const sendInitialGroupMessage = (
  members: Profile[],
  message: string
): ThunkAction => async (dispatch, getState, { callZome }) => {
  const { conversations, messages } = getState().groupConversations;
  const name = members.map((member) => member.username).join(", ");
  const groupRes = await callZome({
    zomeName: ZOMES.GROUP,
    fnName: FUNCTIONS[ZOMES.GROUP].CREATE_GROUP,
    payload: {
      name,
      members: members.map((member) => member.id),
    },
  });
  if (groupRes?.type !== "error") {
    const date = new Date(groupRes.content.created[0] * 1000);

    const messageRes = await callZome({
      zomeName: ZOMES.GROUP,
      fnName: FUNCTIONS[ZOMES.GROUP].SEND_MESSAGE,
      payload: {
        sender: groupRes.content.creator,
        group_hash: groupRes.group_id,
        payload_input: {
          Text: {
            payload: message,
          },
        },
      },
    });
    if (messageRes?.type !== "error") {
      const groupConversation: GroupConversation = {
        originalGroupEntryHash: groupRes.group_id,
        originalGroupHeaderHash: groupRes.group_revision_id,
        createdAt: date,
        creator: groupRes.content.creator,
        messages: [Uint8ArrayToBase64(messageRes.id)],
        versions: [
          {
            groupEntryHash: groupRes.group_id,
            name,
            conversants: members.map((contact) =>
              Uint8ArrayToBase64(contact.id)
            ),
            timestamp: date,
          },
        ],
      };
      const groupMessage: GroupMessage = {
        groupMessageEntryHash: messageRes.id,
        groupEntryHash: groupRes.group_id,
        author: groupRes.content.creator,
        payload: {
          payload: message,
        },
        timestamp: new Date(messageRes.content.created[0] * 1000),
        readList: {},
      };
      dispatch({
        type: SET_CONVERSATIONS,
        conversations: {
          ...conversations,
          [Uint8ArrayToBase64(groupRes.group_id)]: groupConversation,
        },
      });
      dispatch({
        type: SET_MESSAGES,
        messages: {
          ...messages,
          [Uint8ArrayToBase64(messageRes.id)]: groupMessage,
        },
      });
      return groupConversation;
    }
  }
  return false;
};

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
