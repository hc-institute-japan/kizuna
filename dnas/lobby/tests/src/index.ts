import { Orchestrator } from "@holochain/tryorama";
import { Config } from "@holochain/tryorama";

const orchestrator = new Orchestrator();

// Configure a conductor with two identical DNAs,
// differentiated by UUID, nicknamed "alice" and "bobbo"
const config = Config.gen({
  alice: Config.dna("../kizuna.dna.gz", null),
  bobby: Config.dna("../kizuna.dna.gz", null),
});

require("./kizuna")(orchestrator, config);
// require('./contacts')(orchestrator, config);

orchestrator.run();
