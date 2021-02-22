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
  sendMessageInTargetDate,
  getNextBachOfMessagesTest,
} from "./group_message";

export default (orchestrator, config, installables) => {
  // Group CRUD and validation related tests.
  // craeteGroupTest(orchestrator, config, installables);
  // addAndRemoveMembersTest(orchestrator, config, installables);
  // updateGroupNameTest(orchestrator, config, installables);
  // validateCreateGroupTest(orchestrator, config, installables);

  // GroupMessage related tests
  // groupTypingIndicatorTest(orchestrator, config, installables);
  sendMessageTest(orchestrator, config, installables);
  sendMessageInTargetDate(orchestrator, config, installables);
  // readGroupMessageTest(orchestrator, config, installables);
  // getNextBachOfMessagesTest(orchestrator, config, installables);
};
