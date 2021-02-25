import {
  craeteGroupTest,
  addAndRemoveMembersTest,
  updateGroupNameTest,
  validateCreateGroupTest,
} from "./group";

import {
  groupTypingIndicatorTest,
  sendMessageTest,
  readGroupMessageTest,
  getMessagesByGroupByTimestampTest,
  getNextBachOfMessagesTest,
  getLatestMessagesForAllGroupsTest,
} from "./group_message";

export default (orchestrator, config, installables) => {
  // Group CRUD and validation related tests.
  // craeteGroupTest(orchestrator, config, installables);
  // addAndRemoveMembersTest(orchestrator, config, installables);
  // updateGroupNameTest(orchestrator, config, installables);
  // validateCreateGroupTest(orchestrator, config, installables);

  // GroupMessage related tests
  sendMessageTest(orchestrator, config, installables);
  getLatestMessagesForAllGroupsTest(orchestrator, config, installables);
  getMessagesByGroupByTimestampTest(orchestrator, config, installables);
  groupTypingIndicatorTest(orchestrator, config, installables);
  readGroupMessageTest(orchestrator, config, installables);
  getNextBachOfMessagesTest(orchestrator, config, installables);
};
