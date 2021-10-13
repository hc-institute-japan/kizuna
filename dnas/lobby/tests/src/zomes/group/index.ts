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

export default (config, installables) => {
  // Group CRUD and validation related tests.
  createGroupTest(config, installables);
  addAndRemoveMembersTest(config, installables); // *timeout in register_dna
  updateGroupNameTest(config, installables);
  validateCreateGroupTest(config, installables);
  // GroupMessage related tests
  sendMessageTest(config, installables);
  pinMessageTest(config, installables);
  sendMessageswithFilesTest(config, installables);
  sendLargeSetOfFilesTest(config, installables);
  getPreviousGroupMessagesTest(config, installables);
  getMessagesByGroupByTimestampTest(config, installables); // *timeout in register_dna
  getLatestMessagesForAllGroupsTest(config, installables);
  fetchFilesForAParticularDateTest(config, installables);
  groupTypingIndicatorTest(config, installables); // *timeout in register_dna
  readGroupMessageTest(config, installables); // *timeout in register dna
};
