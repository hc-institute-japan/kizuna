import {
  createGroupTest,
  addAndRemoveMembersTest,
  updateGroupNameTest,
  validateCreateGroupTest,
} from "./group";

import {
  groupTypingIndicatorTest,
  sendMessageTest,
  readGroupMessageTest,
  getMessagesByGroupByTimestampTest,
  getNextBatchOfMessagesTest,
  getLatestMessagesForAllGroupsTest,
  sendMessageswithFilesTest,
  sendLargeSetOfFilesTest,
  fetchFilesForAParticularDateTest,
} from "./group_message";

export default (config, installables) => {

  // Group CRUD and validation related tests.
  createGroupTest(config, installables); // good
  addAndRemoveMembersTest(config, installables); // good
  updateGroupNameTest(config, installables); // good
  validateCreateGroupTest(config, installables); //good
  
  // GroupMessage related tests
  sendMessageTest(config, installables); // good
  sendMessageswithFilesTest(config, installables); // good
  sendLargeSetOfFilesTest(config, installables); // good
  getNextBatchOfMessagesTest(config, installables); // good
  getMessagesByGroupByTimestampTest(config, installables); // good
  getLatestMessagesForAllGroupsTest(config, installables); // good
  fetchFilesForAParticularDateTest(config, installables); // good
  groupTypingIndicatorTest(config, installables); // good
  readGroupMessageTest(config, installables); // good


  
};
