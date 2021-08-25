// group CRUDs
import createGroupTest from "./crud/createGroup";
import addAndRemoveMembersTest from "./crud/addAndRemoveMembers";
import updateGroupNameTest from "./crud/updateGroupName";

// validation
import validateCreateGroupTest from "./validations/validateCreateGroup";

// group message
import {
  sendMessageTest,
  sendLargeSetOfFilesTest,
  sendMessageswithFilesTest,
} from "./group_message/sendMessage";

import { pinMessageTest } from "./group_message/pinMessage";

import { getPreviousGroupMessagesTest } from "./group_message/getPreviousGroupMessages";
import {
  getMessagesByGroupByTimestampTest,
  fetchFilesForAParticularDateTest,
} from "./group_message/getMessagesByGroupByTimestamp";
import { getLatestMessagesForAllGroupsTest } from "./group_message/getLatestMessagesForAllGroups";
import { groupTypingIndicatorTest } from "./group_message/typingIndicator";
import { readGroupMessageTest } from "./group_message/readGroupMessage";

export default (config) => {
  // Group CRUD and validation related tests.
  addAndRemoveMembersTest(config);
  createGroupTest(config);
  updateGroupNameTest(config);
  validateCreateGroupTest(config);

  // GroupMessage related tests
  sendMessageTest(config);
  pinMessageTest(config);
  sendMessageswithFilesTest(config);
  sendLargeSetOfFilesTest(config);
  getPreviousGroupMessagesTest(config);
  getMessagesByGroupByTimestampTest(config);
  getLatestMessagesForAllGroupsTest(config);
  fetchFilesForAParticularDateTest(config);
  groupTypingIndicatorTest(config);
  readGroupMessageTest(config);
};
