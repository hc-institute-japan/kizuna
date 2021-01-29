import { Config, Orchestrator, InstallAgentsHapps, TransportConfigType } from '@holochain/tryorama';
import path from 'path';

import contacts from './zomes/contacts'
import preference from './zomes/preference'
// import request from './zomes/request'
import group from './zomes/group'


const network = {
  transport_pool: [{
    type: TransportConfigType.Quic,
  }],
  bootstrap_service: "https://bootstrap.holo.host"
}
const config = Config.gen({network});


const kizuna = path.join('../kizuna.dna.gz');

const install2Agents: InstallAgentsHapps = [
  [[kizuna]],
  [[kizuna]]
] 

const install3Agents: InstallAgentsHapps = [
  [[kizuna]],
  [[kizuna]],
  [[kizuna]]
] 

const installables = {
  two: install2Agents,
  theee: install3Agents
};



const installation: InstallAgentsHapps = [
  [[kizuna]]
];

const orchestrator = new Orchestrator();




//contacts(orchestrator, config, installables);
// preference(orchestrator, config, installable);
// request(orchestrator, config);



group(orchestrator, config,installation);

orchestrator.run();
