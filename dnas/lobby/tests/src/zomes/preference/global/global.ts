import { Orchestrator } from "@holochain/tryorama";
import { installAgents, MEM_PROOF1 } from "../../../install";
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

const global = (config) => {
  orchestrator.registerScenario(
    "Get and set global preference",
    async (s, t) => {
      const [conductor] = await s.players([config]);
      const [alice_lobby_happ] = await installAgents(conductor, ["alice"]);

      const [alice_conductor] = alice_lobby_happ.cells;
      // const [alice_dna, alice_pubkey] = alice_conductor.cellId;
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

  orchestrator.run();
};

export default global;
