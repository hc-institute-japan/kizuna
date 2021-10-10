import { Orchestrator } from "@holochain/tryorama";
import { Installables } from "../../../types";
import { delay } from "../../../utils";

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

const per_agent = (config, installables: Installables) => {
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
      delay(5000);
      const [alice_lobby_happ] = await alice.installAgentsHapps(
        installables.one
      );
      console.log("installed happ to agent 1/5");
      const [bobby_lobby_happ] = await bobby.installAgentsHapps(
        installables.one
      );
      console.log("installed happ to agent 2/5");
      const [clark_lobby_happ] = await clark.installAgentsHapps(
        installables.one
      );
      console.log("installed happ to agent 3/5");
      const [diego_lobby_happ] = await diego.installAgentsHapps(
        installables.one
      );
      console.log("installed happ to agent 4/5");
      const [ethan_lobby_happ] = await ethan.installAgentsHapps(
        installables.one
      );
      console.log("installed happ to agent 5/5");

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
          // typingIndicator: [bobby_pubkey, clark_pubkey],
          // readReceipt: [clark_pubkey],
        }
      );

      t.deepEqual(preference, {
        typingIndicator: [clark_pubkey, diego_pubkey],
        readReceipt: [diego_pubkey],
        // typingIndicator: [bobby_pubkey, clark_pubkey],
        // readReceipt: [clark_pubkey],
      });

      preference = await call(
        alice_conductor,
        "preference",
        "set_per_agent_preference",
        {
          // typingIndicator: [],
          readReceipt: [ethan_pubkey],
          // readReceipt: [bobby_pubkey],
        }
      );

      t.deepEqual(preference, {
        typingIndicator: [clark_pubkey, diego_pubkey],
        readReceipt: [ethan_pubkey],
        // typingIndicator: [bobby_pubkey, clark_pubkey],
        // readReceipt: [bobby_pubkey],
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
        // typingIndicator: [bobby_pubkey, clark_pubkey],
        // readReceipt: [bobby_pubkey],
      });
    }
  );
  orchestrator.run();
};

export default per_agent;
