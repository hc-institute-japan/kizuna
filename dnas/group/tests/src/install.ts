import { InstalledHapp, Player } from "@holochain/tryorama";
import path from "path";

const groupDna = path.join(__dirname, "../../workdir/dna/group.dna");

export const installAgents = async (
  conductor: Player,
  agentNames: string[]
) => {
  const admin = conductor.adminWs();
  const dnaHash = await conductor.registerDna(
    { path: groupDna },
    conductor.scenarioUID
  );
  const agentsHapps: Array<InstalledHapp> = [];
  for (let i = 0; i < agentNames.length; i++) {
    const agent = agentNames[i];
    console.log(`generating key for: ${agent}:`);
    const agent_key = await admin.generateAgentPubKey();
    console.log(`${agent} pubkey:`, agent_key.toString("base64"));

    let dna = {
      hash: dnaHash,
      nick: "group",
      role_id: "group",
    };

    const req = {
      installed_app_id: `${agent}_kizuna`,
      agent_key,
      dnas: [dna],
    };
    console.log(`installing happ for: ${agent}`);
    const agentHapp = await conductor._installHapp(req);
    agentsHapps.push(agentHapp);
  }

  return agentsHapps;
};
