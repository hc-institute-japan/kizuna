import { ThunkAction } from "../../types";
import { base64ToUint8Array } from "../../../utils/helpers";
import { Profile } from "../../profile/types";
import {
  // IO
  GroupConversation,
  GroupMessageInput,
} from "../types";
import { FilePayloadInput } from "../../commons/types";
import { createGroup } from "./createGroup";
import { sendGroupMessage } from "./sendGroupMessage";

export const sendInitialGroupMessage =
  (
    members: Profile[],
    // need to handle files as well
    message: string,
    files: FilePayloadInput[]
  ): ThunkAction =>
  async (dispatch, getState) => {
    let name = members.map((member) => member.username);
    name.push(getState().profile.username!);
    const groupResult: GroupConversation = await dispatch(
      createGroup({
        name: name.join(","),
        members: members.map((member) =>
          Buffer.from(base64ToUint8Array(member.id).buffer)
        ),
      })
    );

    let inputs: GroupMessageInput[] = [];

    files.forEach((file: any) => {
      let filePayloadInput: FilePayloadInput = {
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
      let groupMessage: GroupMessageInput = {
        groupHash: base64ToUint8Array(groupResult.originalGroupEntryHash),
        payloadInput: filePayloadInput,
        sender: Buffer.from(base64ToUint8Array(groupResult.creator).buffer),
        // TODO: handle replying to message here as well
        replyTo: undefined,
      };
      inputs.push(groupMessage);
    });

    if (message.length) {
      message = message.trim();
      inputs.push({
        groupHash: base64ToUint8Array(groupResult.originalGroupEntryHash),
        payloadInput: {
          type: "TEXT",
          payload: { payload: message },
        },
        sender: Buffer.from(base64ToUint8Array(groupResult.creator).buffer),
        // TODO: handle replying to message here as well
        replyTo: undefined,
      });
    }

    let messageResults: any[] = [];
    inputs.forEach(async (groupMessage: any) => {
      // TODO: error handling
      let messageResult = await dispatch(sendGroupMessage(groupMessage));
      messageResults.push(messageResult);
    });

    return {
      groupResult,
      messageResults,
    };
  };
