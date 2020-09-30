import { Orchestrator } from '@holochain/tryorama'

const orchestrator = new Orchestrator()

require('./kizuna')(orchestrator)

orchestrator.run()

