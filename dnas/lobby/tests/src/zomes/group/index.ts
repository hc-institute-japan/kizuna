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
} from "./group_message";

export default (orchestrator, config, installables) => {
  // Group CRUD and validation related tests.
  createGroupTest(orchestrator, config, installables);
  addAndRemoveMembersTest(orchestrator, config, installables);
  updateGroupNameTest(orchestrator, config, installables);
  validateCreateGroupTest(orchestrator, config, installables);

  // GroupMessage related tests
  getLatestMessagesForAllGroupsTest(orchestrator, config, installables);
  getMessagesByGroupByTimestampTest(orchestrator, config, installables);
  getNextBatchOfMessagesTest(orchestrator, config, installables);
  sendMessageTest(orchestrator, config, installables);
  sendMessageswithFilesTest(orchestrator, config, installables);
  groupTypingIndicatorTest(orchestrator, config, installables);
  readGroupMessageTest(orchestrator, config, installables);
};
