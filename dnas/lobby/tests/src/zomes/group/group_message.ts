import { ScenarioApi } from "@holochain/tryorama/lib/api";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default (orchestrator, config, installables) => {

  orchestrator.registerScenario("test typing indicator for group chat", async(s,t) =>{

      // TODO: tests

  });

}