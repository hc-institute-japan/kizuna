import { Config, Orchestrator, InstallAgentsHapps } from '@holochain/tryorama';
import path from 'path';

import contacts from './zomes/contacts'
import preference from './zomes/preference'
// import request from './zomes/request'

const config = Config.gen();

const installable: InstallAgentsHapps = [
  // agent 0...
  [
    // happ 0...
    [
      // dna 0...
      path.join('../kizuna.dna.gz')
    ]
  ]
] 
const orchestrator = new Orchestrator();




contacts(orchestrator, config, installable);
preference(orchestrator, config, installable);


// request(orchestrator, config);

// const report = await orchestrator.run()
// console.log(report)
