import { Config, Orchestrator } from '@holochain/tryorama';
import request from './zomes/request'
import contacts from './zomes/contacts'
import preference from './zomes/preference'

const orchestrator = new Orchestrator();

const config = Config.gen({
  alice: Config.dna("../kizuna.dna.gz", null),
  bobby: Config.dna("../kizuna.dna.gz", null),
  clark: Config.dna("../kizuna.dna.gz", null)
});



contacts(orchestrator, config);
preference(orchestrator, Config.gen({
  alice: Config.dna('../kizuna.dna.gz', null),
  bobby: Config.dna('../kizuna.dna.gz', null),
  charlie: Config.dna('../kizuna.dna.gz', null),
  diego: Config.dna('../kizuna.dna.gz', null),
  ethan: Config.dna('../kizuna.dna.gz', null),
})
)


// request(orchestrator, config);

orchestrator.run();
