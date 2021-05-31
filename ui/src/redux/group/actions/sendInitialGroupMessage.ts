import { deserializeHash } from "@holochain-open-dev/core-types";
import { deserializeAgentPubKey } from "../../../utils/helpers";
import { FilePayloadInput } from "../../commons/types";
import { Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import {
  // IO
  GroupConversation,
  GroupMessageInput,
} from "../types";
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

    /* Include yourself in the initial name of the Group */
    name.push(getState().profile.username!);

    const groupResult: GroupConversation = await dispatch(
      createGroup({
        name: name.join(","),
        members: members.map((member: Profile) => member.id),
      })
    );

    let inputs: GroupMessageInput[] = [];

    /* Work on each file that were uploaded and convert them to appropriate input to Zome fn */
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
