// group CRUDs
import createGroupTest from "./crud/createGroup";
import addAndRemoveMembersTest from "./crud/addAndRemoveMembers";
import updateGroupNameTest from "./crud/updateGroupName";

// validation
import validateCreateGroupTest from "./validations/validateCreateGroup";
import validateUpdateGroupTest from "./validations/validateUpdateGroup";

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
  // addAndRemoveMembersTest(config); // ok
  // createGroupTest(config); // ok
  // updateGroupNameTest(config); //ok
  // validateCreateGroupTest(config); // ok
  // validateUpdateGroupTest(config); // ok

  // GroupMessage related tests
  // sendMessageTest(config); // ok
  // pinMessageTest(config); // ok
  // sendMessageswithFilesTest(config); // ok
  // sendLargeSetOfFilesTest(config); //ok
  // getPreviousGroupMessagesTest(config); // ok
  // getMessagesByGroupByTimestampTest(config); // ok
  // getLatestMessagesForAllGroupsTest(config); // ok
  // fetchFilesForAParticularDateTest(config); // ok
  // groupTypingIndicatorTest(config); //ok
  readGroupMessageTest(config); // ok
};
