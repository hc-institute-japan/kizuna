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
  // craeteGroupTest(orchestrator, config, installables);
  // addAndRemoveMembersTest(orchestrator, config, installables);
  // updateGroupNameTest(orchestrator, config, installables);
  // validateCreateGroupTest(orchestrator, config, installables);

  // GroupMessage related tests
<<<<<<< HEAD
  //getLatestMessagesForAllGroupsTest(orchestrator, config, installables);
  //getMessagesByGroupByTimestampTest(orchestrator, config, installables);
  //sendMessageTest(orchestrator, config, installables);
  sendMessageswithFilesTest(orchestrator, config, installables);
=======
  sendMessageTest(orchestrator, config, installables);
  getLatestMessagesForAllGroupsTest(orchestrator, config, installables);
  getMessagesByGroupByTimestampTest(orchestrator, config, installables);
  groupTypingIndicatorTest(orchestrator, config, installables);
  readGroupMessageTest(orchestrator, config, installables);
  getNextBatchOfMessagesTest(orchestrator, config, installables);
>>>>>>> 72abc33959c2f92098b4e61a55b7a5ab31a1d6e7
};
