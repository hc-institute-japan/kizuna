import { Orchestrator } from "@holochain/tryorama";
import { Installables } from "../types";
import { delay } from "../utils";
import {
  installAgents,
  MEM_PROOF1,
  MEM_PROOF2,
  MEM_PROOF3,
  MEM_PROOF4,
  MEM_PROOF5,
} from "../install";

const createPreference = (typingIndicator, readReceipt) => ({
  typingIndicator: typingIndicator,
  readReceipt: readReceipt,
});

const call = async (
  conductor,
  zome,
  zomeFunction,
  payload: any = null,
  timeout = 1000
) => {
  const res = await conductor.call(zome, zomeFunction, payload);
  await delay(timeout);

  return res;
};

let orchestrator = new Orchestrator();

const preference = (config) => {
  orchestrator.registerScenario(
    "Get and set global preference",
    async (s, t) => {
      const [conductor] = await s.players([config]);
      const [alice_lobby_happ] = await installAgents(
        conductor,
        ["alice"],
        [MEM_PROOF1]
      );
      const [alice_conductor] = alice_lobby_happ.cells;

      await delay();
      let preference = null;

      // Both typing and receipt are set to true by default

      preference = await call(alice_conductor, "preference", "get_preference");
      t.deepEqual(preference, createPreference(true, true));

      // Set both typing and receipt to false
      preference = await call(alice_conductor, "preference", "set_preference", {
        typingIndicator: false,
        readReceipt: false,
      });

      t.deepEqual(preference, createPreference(false, false));

      // Set both typing to false and receipt to true
      preference = await call(alice_conductor, "preference", "set_preference", {
        typingIndicator: false,
        readReceipt: true,
      });

      t.deepEqual(preference, createPreference(false, true));

      // Set both typing to true and receipt to false

      preference = await call(alice_conductor, "preference", "set_preference", {
        typingIndicator: true,
        readReceipt: false,
      });

      t.deepEqual(preference, createPreference(true, false));

      // Set typing to false

      preference = await call(alice_conductor, "preference", "set_preference", {
        readReceipt: true,
      });

      t.deepEqual(preference, createPreference(true, true));

      // Set receipt to true

      preference = await call(alice_conductor, "preference", "set_preference", {
        typingIndicator: false,
      });

      t.deepEqual(preference, createPreference(false, true));
    }
  );

  orchestrator.run();

  orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "Get and set per agent preference",
    async (s, t) => {
      const [conductor] = await s.players([config]);
      const [alice_lobby_happ] = await installAgents(
        conductor,
        ["alice"],
        [MEM_PROOF1]
      );
      const [bobby_lobby_happ] = await installAgents(
        conductor,
        ["bobby"],
        [MEM_PROOF2]
      );
      const [clark_lobby_happ] = await installAgents(
        conductor,
        ["clark"],
        [MEM_PROOF3]
      );
      const [diego_lobby_happ] = await installAgents(
        conductor,
        ["diego"],
        [MEM_PROOF4]
      );
      const [ethan_lobby_happ] = await installAgents(
        conductor,
        ["ethan"],
        [MEM_PROOF5]
      );

      const [alice_conductor] = alice_lobby_happ.cells;

      const bobby_pubkey = bobby_lobby_happ.agent;
      const clark_pubkey = clark_lobby_happ.agent;
      const diego_pubkey = diego_lobby_happ.agent;
      const ethan_pubkey = ethan_lobby_happ.agent;

      await delay();

      let preference = null;

      preference = await call(
        alice_conductor,
        "preference",
        "get_per_agent_preference"
      );

      t.deepEqual(preference, {
        typingIndicator: [],
        readReceipt: [],
      });

      preference = await call(
        alice_conductor,
        "preference",
        "set_per_agent_preference",
        {
          typingIndicator: [bobby_pubkey],
        }
      );

      t.deepEqual(preference, {
        typingIndicator: [bobby_pubkey],
        readReceipt: [],
      });

      preference = await call(
        alice_conductor,
        "preference",
        "set_per_agent_preference",
        {
          typingIndicator: [clark_pubkey, diego_pubkey],
          readReceipt: [diego_pubkey],
        }
      );

      t.deepEqual(preference, {
        typingIndicator: [clark_pubkey, diego_pubkey],
        readReceipt: [diego_pubkey],
      });

      preference = await call(
        alice_conductor,
        "preference",
        "set_per_agent_preference",
        {
          readReceipt: [ethan_pubkey],
        }
      );

      t.deepEqual(preference, {
        typingIndicator: [clark_pubkey, diego_pubkey],
        readReceipt: [ethan_pubkey],
      });

      preference = await call(
        alice_conductor,
        "preference",
        "set_per_agent_preference",
        {}
      );

      t.deepEqual(preference, {
        typingIndicator: [clark_pubkey, diego_pubkey],
        readReceipt: [ethan_pubkey],
      });
    }
  );
  orchestrator.run();

  orchestrator = new Orchestrator();

  orchestrator.registerScenario(
    "Get and set per group preference",
    async (s, t) => {
      const [alice, bobby, charlie] = await s.players([config, config, config]);
      const [alice_lobby_happ] = await installAgents(
        alice,
        ["alice"],
        [MEM_PROOF1]
      );

      const [alice_conductor] = alice_lobby_happ.cells;

      await delay();

      let preference = null;

      preference = await call(
        alice_conductor,
        "preference",
        "get_per_group_preference"
      );

      t.deepEqual(preference, {
        typingIndicator: [],
        readReceipt: [],
      });

      preference = await call(
        alice_conductor,
        "preference",
        "set_per_group_preference",
        {
          typingIndicator: ["test_string"],
        }
      );

      t.deepEqual(preference, {
        typingIndicator: ["test_string"],
        readReceipt: [],
      });

      preference = await call(
        alice_conductor,
        "preference",
        "set_per_group_preference",
        {
          typingIndicator: ["test_string_1", "test_string_2"],
          readReceipt: ["test_string_2"],
        }
      );

      t.deepEqual(preference, {
        typingIndicator: ["test_string_1", "test_string_2"],
        readReceipt: ["test_string_2"],
      });

      preference = await call(
        alice_conductor,
        "preference",
        "set_per_group_preference",
        {
          readReceipt: ["test_string_3"],
        }
      );

      t.deepEqual(preference, {
        typingIndicator: ["test_string_1", "test_string_2"],
        readReceipt: ["test_string_3"],
      });

      preference = await call(
        alice_conductor,
        "preference",
        "set_per_group_preference",
        {}
      );
      t.deepEqual(preference, {
        typingIndicator: ["test_string_1", "test_string_2"],
        readReceipt: ["test_string_3"],
      });
    }
  );
  orchestrator.run();
};

export default preference;
