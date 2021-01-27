import { Config, Orchestrator, InstallAgentsHapps } from "@holochain/tryorama";
import path from "path";
import { Installables } from "./types";

import contacts from "./zomes/contacts";
import preference from "./zomes/preference";
// import request from './zomes/request'

const config = Config.gen();
const kizuna = path.join("../kizuna.dna.gz");

const installAgent: InstallAgentsHapps = [[[kizuna]]];

const install2Agents: InstallAgentsHapps = [[[kizuna]], [[kizuna]]];

const install3Agents: InstallAgentsHapps = [[[kizuna]], [[kizuna]], [[kizuna]]];

const installables: Installables = {
  one: installAgent,
  two: install2Agents,
  three: install3Agents,
};

const orchestrator = new Orchestrator();

contacts(orchestrator, config, installables);
preference(orchestrator, config, installables);

// request(orchestrator, config);

orchestrator.run();
