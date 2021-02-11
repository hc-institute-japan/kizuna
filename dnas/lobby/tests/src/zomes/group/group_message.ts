const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export function groupTypingIndicatorTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "test typing indicator for group chat",
    async (s, t) => {
      // TODO: tests
    }
  );
}

export function readGroupMessageTest(orchestrator, config, installables) {
  orchestrator.registerScenario(
    "test read message for group chat",
    async (s, t) => {
      // TODO: tests
    }
  );
}
