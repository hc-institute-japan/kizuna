import { Installables } from "../types";
import { delay } from "../utils";

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

const preference = (orchestrator, config, installables: Installables) => {
  orchestrator.registerScenario(
    "Get and set global preference",
    async (s, t) => {
      const [alice] = await s.players([config]);
      await alice.startup({});
      const [alice_lobby_happ] = await alice.installAgentsHapps(
        installables.one
      );
      const alice_conductor = alice_lobby_happ[0].cells[0];

      // const [alice_dna, alice_pubkey] = alice_conductor.cellId;
      let preference = null;

      /**
       * Both typing and receipt are set to true by default
       */

      preference = await call(alice_conductor, "preference", "get_preference");
      t.deepEqual(preference, createPreference(true, true));

      /**
       * Set both typing and receipt to false
       */
      preference = await call(alice_conductor, "preference", "set_preference", {
        typingIndicator: false,
        readReceipt: false,
      });

      t.deepEqual(preference, createPreference(false, false));

      /**
       * Set both typing to false and receipt to true
       */
      preference = await call(alice_conductor, "preference", "set_preference", {
        typingIndicator: false,
        readReceipt: true,
      });

      t.deepEqual(preference, createPreference(false, true));

      /**
       * Set both typing to true and receipt to false
       */

      preference = await call(alice_conductor, "preference", "set_preference", {
        typingIndicator: true,
        readReceipt: false,
      });

      t.deepEqual(preference, createPreference(true, false));

      /**
       * Set typing to false
       */

      preference = await call(alice_conductor, "preference", "set_preference", {
        readReceipt: true,
      });

      t.deepEqual(preference, createPreference(true, true));

      /**
       * Set receipt to true
       */

      preference = await call(alice_conductor, "preference", "set_preference", {
        typingIndicator: false,
      });

      t.deepEqual(preference, createPreference(false, true));
    }
  );

  orchestrator.registerScenario(
    "Get and set per agent preference",
    async (s, t) => {
      const [alice, bobby, clark, diego, ethan] = await s.players([
        config,
        config,
        config,
        config,
        config,
      ]);
      await alice.startup({});
      await bobby.startup({});
      await clark.startup({});
      await diego.startup({});
      await ethan.startup({});
      const [alice_lobby_happ] = await alice.installAgentsHapps(
        installables.one
      );
      const [bobby_lobby_happ] = await bobby.installAgentsHapps(
        installables.one
      );
      const [clark_lobby_happ] = await clark.installAgentsHapps(
        installables.one
      );
      const [diego_lobby_happ] = await diego.installAgentsHapps(
        installables.one
      );
      const [ethan_lobby_happ] = await ethan.installAgentsHapps(
        installables.one
      );

      const alice_conductor = alice_lobby_happ[0].cells[0];
      const bobby_conductor = bobby_lobby_happ[0].cells[0];
      const clark_conductor = clark_lobby_happ[0].cells[0];
      const diego_conductor = diego_lobby_happ[0].cells[0];
      const ethan_conductor = ethan_lobby_happ[0].cells[0];

      const [alice_dna, alice_pubkey] = alice_conductor.cellId;
      const [bobby_dna, bobby_pubkey] = bobby_conductor.cellId;
      const [charlie_dna, clark_pubkey] = clark_conductor.cellId;
      const [diego_dna, diego_pubkey] = diego_conductor.cellId;
      const [ethan_dna, ethan_pubkey] = ethan_conductor.cellId;

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

  orchestrator.registerScenario(
    "Get and set per group preference",
    async (s, t) => {
      const [alice] = await s.players([config]);
      const [alice_lobby_happ] = await alice.installAgentsHapps(
        installables.one
      );
      const alice_conductor = alice_lobby_happ[0].cells[0];

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
};

export default preference;
