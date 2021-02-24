import {
  Config,
  Orchestrator,
  InstallAgentsHapps,
  TransportConfigType,
} from "@holochain/tryorama";
import { Installables } from "./types";
import path from "path";

import contacts from "./zomes/contacts";
import preference from "./zomes/preference";
// import request from './zomes/request'
import group from "./zomes/group";

const network = {
  transport_pool: [
    {
      type: TransportConfigType.Quic,
    },
  ],
  bootstrap_service: "https://bootstrap.holo.host",
};
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

// contacts(orchestrator, config, installables);
// group(orchestrator, config, installables);
preference(orchestrator, config, installables);
// request(orchestrator, config);

orchestrator.run();
