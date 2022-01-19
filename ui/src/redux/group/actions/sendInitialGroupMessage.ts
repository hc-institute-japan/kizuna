import { FilePayloadInput } from "../../commons/types";
import { pushError } from "../../error/actions";
import { Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import {
  // IO
  GroupConversation,
  GroupMessageInput,
} from "../types";
import createGroup from "./createGroup";
import sendGroupMessage from "./sendGroupMessage";
import setErrGroupMessage from "./setErrGroupMessage";

const sendInitialGroupMessage =
  (
    members: Profile[],
    // need to handle files as well
    message: string,
    files: FilePayloadInput[]
  ): ThunkAction =>
  async (dispatch, getState) => {
    const name = members.map((member) => member.username);

    /* Include yourself in the initial name of the Group */
    name.push(getState().profile.username!);

    try {
      const groupResult: GroupConversation = await dispatch(
        createGroup({
          name: name.join(","),
          members: members.map((member: Profile) => member.id),
        })
      );

      const inputs: GroupMessageInput[] = [];
      /* Work on each file that were uploaded and convert them to appropriate input to Zome fn */
      files.forEach((file: any) => {
        const filePayloadInput: FilePayloadInput = {
          type: "FILE",
          payload: {
            metadata: {
              fileName: file.payload.metadata.fileName,
              fileSize: file.payload.metadata.fileSize,
              fileType: file.payload.metadata.fileType,
            },
            fileType: file.payload.fileType,
            fileBytes: file.payload.fileBytes,
          },
        };
        const groupMessage: GroupMessageInput = {
          groupId: groupResult.originalGroupId,
          payloadInput: filePayloadInput,
          sender: groupResult.creator,
          // TODO: handle replying to message here as well
          replyTo: undefined,
        };
        inputs.push(groupMessage);
      });

      /* if there is a text payload, then include that in the input to the zome fn as well */
      if (message.length) {
        inputs.push({
          groupId: groupResult.originalGroupId,
          payloadInput: {
            type: "TEXT",
            payload: { payload: message },
          },
          sender: groupResult.creator,
          // TODO: handle replying to message here as well
          replyTo: undefined,
        });
      }

      const messageResults: any[] = [];
      inputs.forEach(async (groupMessage) => {
        // res: boolean | group message res
        await dispatch(sendGroupMessage(groupMessage)).then((res: any) => {
          res === false
            ? dispatch(setErrGroupMessage(groupMessage))
            : messageResults.push(res);
        });
      });

      return {
        groupResult,
        messageResults,
      };
    } catch (e) {
      /* err from createGoup.ts */
      switch (true) {
        case (e as any).message.includes(
          "cannot create group with blocked agents"
        ):
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.create-group.1" })
          );
          break;
        case (e as any).message.includes(
          "groups cannot be created with less than 3 members"
        ):
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.create-group.2" })
          );
          break;
        case (e as any).message.includes(
          "creator AgentPubKey cannot be included in the group members list"
        ):
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.create-group.3" })
          );
          break;
        case (e as any).message.includes(
          "the group name must at least contain 1 character and maximun 50 characters"
        ):
          console.log(e);
          dispatch(
            pushError("TOAST", {}, { id: "redux.err.group.create-group.4" })
          );
          break;
        default:
          dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
          return false;
      }
    }
    return false;
  };

export default sendInitialGroupMessage;
