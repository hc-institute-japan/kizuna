import {
  craeteGroupTest,
  addAndRemoveMembersTest,
  updateGroupNameTest,
  validateCreateGroupTest,
} from "./group";

import { groupTypingIndicatorTest } from "./group_message";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default (orchestrator, config, installables) => {
  // Group CRUD and validation related tests.
  //   craeteGroupTest(orchestrator, config, installables);
  //   addAndRemoveMembersTest(orchestrator, config, installables);
  //   updateGroupNameTest(orchestrator, config, installables);
  //   validateCreateGroupTest(orchestrator, config, installables);

  // GroupMessage related tests
  groupTypingIndicatorTest(orchestrator, config, installables);
};
