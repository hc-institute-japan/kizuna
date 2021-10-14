import { Orchestrator } from "@holochain/tryorama";
import {
  installAgents,
  MEM_PROOF1,
  MEM_PROOF2,
  MEM_PROOF3,
  MEM_PROOF4,
  MEM_PROOF5,
} from "../../../install";
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

const per_agent = (config) => {
  orchestrator.registerScenario(
    "Get and set per agent preference",
    async (s, t) => {
      const [conductor] = await s.players([config]);
      const [alice_lobby_happ] = await installAgents(conductor, ["alice"]);
      const [bobby_lobby_happ] = await installAgents(conductor, ["bobby"]);
      const [clark_lobby_happ] = await installAgents(conductor, ["clark"]);
      const [diego_lobby_happ] = await installAgents(conductor, ["diego"]);
      const [ethan_lobby_happ] = await installAgents(conductor, ["ethan"]);

      const [alice_conductor] = alice_lobby_happ.cells;

      const bobby_pubkey = bobby_lobby_happ.agent;
      const clark_pubkey = clark_lobby_happ.agent;
      const diego_pubkey = diego_lobby_happ.agent;
      const ethan_pubkey = ethan_lobby_happ.agent;

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
