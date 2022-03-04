import { serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { timestampToDate } from "../../../utils/services/DateService";
import { Payload } from "../../commons/types";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import { GroupMessage, SetPinnedMessages, SET_PINNED_MESSAGES } from "../types";
import getLatestGroupVersion from "./getLatestGroupVersion";
import { fetchUsernameOfMembers } from "./helpers";

export const fetchPinnedMessages =
  (groupId: string): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    try {
      const res: any = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].FETCH_PINNED_MESSAGES,
        payload: groupId,
      });

      const groupConversation = getState().groups.conversations[groupId];
      if (!groupConversation) {
        dispatch(getLatestGroupVersion(groupId));
      } else {
        const rawResultArr = Object.values(res as Object);
        const pinnedMessages: { [key: string]: GroupMessage } = {};
        const myAgentId = await getAgentId();
        const pinnedMessageIds = rawResultArr.map(async (raw) => {
          const rawResult = raw.entry;

          const id = serializeHash(rawResult.messageId);
          const author = Object.values(
            await fetchUsernameOfMembers(
              getState(),
              [serializeHash(rawResult.sender)],
              callZome,
              serializeHash(myAgentId!)
            )
          )[0].username;

          const payload: Payload =
            rawResult.payload.type === "TEXT"
              ? rawResult.payload
              : {
                  type: "FILE",
                  fileType: rawResult.payload.payload.fileType.type,
                  fileHash: serializeHash(
                    rawResult.payload.payload.metadata.fileHash
                  ),
                  fileName: rawResult.payload.payload.metadata.fileName,
                  fileSize: rawResult.payload.payload.metadata.fileSize,
                  thumbnail:
                    rawResult.payload.payload.fileType.payload?.thumbnail,
                };

          const groupMessage: GroupMessage = {
            groupId,
            groupMessageId: id,
            author,
            payload,
            timestamp: timestampToDate(rawResult.created),
            readList: {},
          };

          pinnedMessages[id] = groupMessage;

          return id;
        });

        await Promise.all(pinnedMessageIds).then(
          (res) => (groupConversation.pinnedMessages = res)
        );

        dispatch<SetPinnedMessages>({
          type: SET_PINNED_MESSAGES,
          pinnedMessages: {
            ...getState().groups.pinnedMessages,
            ...pinnedMessages,
          },
          conversations: {
            ...getState().groups.conversations,
            [groupId]: groupConversation,
          },
        });
      }
    } catch (e) {
      return dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
    }
  };
