import { Config } from "@holochain/tryorama";
import * as _ from "lodash";
import { cond } from "lodash";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

//RUST_LOG=debug TRYORAMA_LOG_LEVEL=debug RUST_BACKTRACE=1
// Configure a conductor with two identical DNAs,
// differentiated by UUID, nicknamed "alice" and "bobbo"

const generateConfig = (config) => Config.gen(config);

module.exports = (orchestrator) => {
  orchestrator.registerScenario("kizuna test", async (s, t) => {
    // spawn the conductor process
    const config = generateConfig({
      neil: Config.dna("../kizuna.dna.gz", null),
      alice: Config.dna("../kizuna.dna.gz", null),
    });

    const { conductor } = await s.players({ conductor: config });
    await conductor.spawn();

    const pubKey = await conductor.call(
      "neil",
      "request",
      "get_agent_key",
      null
    );

    const receive = await conductor.call(
      "alice",
      "request",
      "send_request",
      pubKey.agent_key
    );

    console.log(receive);

    if (receive.code === "request_received") {
      const accept = await conductor.call(
        "alice",
        "request",
        "accept_request",
        pubKey.agent_key
      );
      t.deepEqual(accept, "request_accepted");
    }
  });
};
