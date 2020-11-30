import { Orchestrator } from "@holochain/tryorama";
import { Config } from "@holochain/tryorama";
import request from './request'
import contacts from './contacts'
import p2pmessageasync from "./p2pmessageasync";

const orchestrator = new Orchestrator();

// Configure a conductor with two identical DNAs,
// differentiated by UUID, nicknamed "alice" and "bobbo"
const config = Config.gen({
  alice: Config.dna("../kizuna.dna.gz", null),
  bobby: Config.dna("../kizuna.dna.gz", null),
  clark: Config.dna("../kizuna.dna.gz", null)
});

// contacts(orchestrator, config);
// request(orchestrator, config);
p2pmessageasync(orchestrator, config);

orchestrator.run();
