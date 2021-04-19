import {
  Config,
  NetworkType,
  InstallAgentsHapps,
  TransportConfigType,
} from "@holochain/tryorama";
import { Installables } from "./types";
import path from "path";

import request from './zomes/request'
import contacts from "./zomes/contacts";
import preference from "./zomes/preference";
import group from "./zomes/group";

// QUIC
const network = {
  network_type: NetworkType.QuicBootstrap,
  transport_pool: [{type: TransportConfigType.Quic}],
  bootstrap_service: "https://bootstrap-staging.holo.host/",
};

const config = Config.gen({network});
const kizuna = path.join(__dirname, "../../workdir/dna/Kizuna.dna");

const installAgent: InstallAgentsHapps = [[[kizuna]]];

const install2Agents: InstallAgentsHapps = [[[kizuna]], [[kizuna]]];

const install3Agents: InstallAgentsHapps = [[[kizuna]], [[kizuna]], [[kizuna]]];

const installables: Installables = {
  one: installAgent,
  two: install2Agents,
  three: install3Agents,
};


group( config, installables);
contacts(config, installables);
preference(config, installables);
request(config); // not passing 

