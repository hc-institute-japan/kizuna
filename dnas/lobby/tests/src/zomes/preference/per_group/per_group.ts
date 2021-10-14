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

const per_group = (config) => {
  orchestrator.registerScenario(
    "Get and set per group preference",
    async (s, t) => {
      const [conductor] = await s.players([config]);
      const [alice_lobby_happ] = await installAgents(conductor, ["alice"]);
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
  orchestrator.run();
};

export default per_group;
