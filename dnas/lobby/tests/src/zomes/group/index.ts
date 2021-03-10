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

export default (orchestrator, config, installables) => {
  // Group CRUD and validation related tests.
  createGroupTest(orchestrator, config, installables);
  addAndRemoveMembersTest(orchestrator, config, installables);
  updateGroupNameTest(orchestrator, config, installables);
  validateCreateGroupTest(orchestrator, config, installables);
  // GroupMessage related tests
  sendMessageTest(orchestrator, config, installables); // good
  sendMessageswithFilesTest(orchestrator, config, installables); // good
  sendLargeSetOfFilesTest(orchestrator, config, installables); // good
  getNextBatchOfMessagesTest(orchestrator, config, installables); // good
  getMessagesByGroupByTimestampTest(orchestrator, config, installables); // good
  getLatestMessagesForAllGroupsTest(orchestrator, config, installables); // good
  fetchFilesForAParticularDateTest(orchestrator, config, installables); // good
  groupTypingIndicatorTest(orchestrator, config, installables); // good
  readGroupMessageTest(orchestrator, config, installables); // good
};
