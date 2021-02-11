import {
  Config,
  Orchestrator,
  InstallAgentsHapps,
  TransportConfigType,
} from "@holochain/tryorama";
import { Installables } from "./types";
import path from "path";

// import request from './zomes/request'
import contacts from "./zomes/contacts";
import preference from "./zomes/preference";
import group from "./zomes/group/group";
import group_message from "./zomes/group/group_message";

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

group(orchestrator, config, installables);
group_message(orchestrator, config, installables);
contacts(orchestrator, config, installables);
preference(orchestrator, config, installables);
// request(orchestrator, config);

orchestrator.run();
