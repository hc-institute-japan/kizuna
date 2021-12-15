import { Profile } from "../../profile/types";
import { ThunkAction } from "../../types";
import { GroupMessage, GroupMessageBundle } from "../types";

const getMessagesWithProfile =
  (messageIds: string[], groupId: string): ThunkAction =>
  (_dispatch, getState) => {
    const { messages, members, errMsgs } = getState().groups;
    const profile = getState().profile;
    /* 
      Retrieve the messgaes from redux store and modify
      the author field to Profile type.
    */
    let messageBundles: GroupMessageBundle[] = messageIds.map((messageId) => {
      /* retrieve the message content from redux */
      const message: GroupMessage = messages[messageId];
      const authorProfile: Profile = members[message.author];

      return {
        ...message,
        author: authorProfile
          ? authorProfile
          : // if profile was not found from allMembers, then the author is self
            // assuming that allMembers have all the members of group at all times
            {
              username: profile.username!,
              id: message.author,
              fields: profile.fields,
            },
      };
    });
    // append error messages if there are any
    if (errMsgs[groupId]) {
      messageBundles = messageBundles.concat(errMsgs[groupId]);
    }
    messageBundles.sort((x, y) => {
      return x.timestamp.getTime() - y.timestamp.getTime();
    });

    return messageBundles;
  };

export default getMessagesWithProfile;
