import { InstallAgentsHapps, InstalledHapp, Player } from "@holochain/tryorama";
import path from "path";

export const MEM_PROOF1 = Buffer.from(
  "3gACrXNpZ25lZF9oZWFkZXLeAAKmaGVhZGVy3gACp2NvbnRlbnTeAAekdHlwZaZDcmVhdGWmYXV0aG9yxCeEICREcSxdIB5vMom0+wtjVdw148AUiJ4UG3PYBNqeWiTGdILUqTOpdGltZXN0YW1wks5gweIkzivzEHGqaGVhZGVyX3Nlcc0BMKtwcmV2X2hlYWRlcsQnhCkks5/HpSpAL3RXYHfpjhAk8ZXayukBa4/54aur1mBaKL95vbeDqmVudHJ5X3R5cGXeAAGjQXBw3gADomlkAKd6b21lX2lkAKp2aXNpYmlsaXR53gABplB1YmxpY8CqZW50cnlfaGFzaMQnhCEkyy3pfmVBc8BkzVX5+jlnJ3TBYFrrdIdGdEMz0170ZSUTdfg9pGhhc2jEJ4QpJI+UES7dIWlQ0LcaXyirSViVBv7mCZr8GbZKBXZ7GxxR5WFvyKlzaWduYXR1cmXEQLpug6Zw3jDRuqiykCLCHrrD6q0XNxXPYe/Nq/Ec4YXY9Q3ISu9HuCC4qnAhAAOY8fcRNBIfe2WSmYfv1b2ViQalZW50cnneAAGnUHJlc2VudN4AAqplbnRyeV90eXBlo0FwcKVlbnRyecQngqRyb2xlpUFETUlOrnJlY29yZF9sb2NhdG9yqzBAaG9sby5ob3N0",
  "base64"
);
export const MEM_PROOF2 = Buffer.from(
  "3gACrXNpZ25lZF9oZWFkZXLeAAKmaGVhZGVy3gACp2NvbnRlbnTeAAekdHlwZaZDcmVhdGWmYXV0aG9yxCeEICREcSxdIB5vMom0+wtjVdw148AUiJ4UG3PYBNqeWiTGdILUqTOpdGltZXN0YW1wks5gweIkzixIo3KqaGVhZGVyX3Nlcc0BMatwcmV2X2hlYWRlcsQnhCkkj5QRLt0haVDQtxpfKKtJWJUG/uYJmvwZtkoFdnsbHFHlYW/IqmVudHJ5X3R5cGXeAAGjQXBw3gADomlkAKd6b21lX2lkAKp2aXNpYmlsaXR53gABplB1YmxpY8CqZW50cnlfaGFzaMQnhCEkcnWUeAP9pcKJDhZ4o4O90LrmS18D+GEzbW+NDjO8Z0wf3/T9pGhhc2jEJ4QpJEtzArTCIZZC+l/TQktzXOl+xrmogg1nMIB3Ft5NjnxRZhC//KlzaWduYXR1cmXEQEAf7f2MAkMgXiD266vMoLihO0nrUSpUQIsnu8v7nZkec7OnDOQ639H6f0MfrGH3kpNetQ4j6YH1QE7X2RLrLgKlZW50cnneAAGnUHJlc2VudN4AAqplbnRyeV90eXBlo0FwcKVlbnRyecQngqRyb2xlpUFETUlOrnJlY29yZF9sb2NhdG9yqzFAaG9sby5ob3N0",
  "base64"
);
export const MEM_PROOF3 = Buffer.from(
  "3gACrXNpZ25lZF9oZWFkZXLeAAKmaGVhZGVy3gACp2NvbnRlbnTeAAekdHlwZaZDcmVhdGWmYXV0aG9yxCeEICREcSxdIB5vMom0+wtjVdw148AUiJ4UG3PYBNqeWiTGdILUqTOpdGltZXN0YW1wks5gweIkziyMlqqqaGVhZGVyX3Nlcc0BMqtwcmV2X2hlYWRlcsQnhCkkS3MCtMIhlkL6X9NCS3Nc6X7GuaiCDWcwgHcW3k2OfFFmEL/8qmVudHJ5X3R5cGXeAAGjQXBw3gADomlkAKd6b21lX2lkAKp2aXNpYmlsaXR53gABplB1YmxpY8CqZW50cnlfaGFzaMQnhCEkNdwxEvRlAVSYhe62yuA+hcSWSDyIGaAGmZhZhldSb6jxs+WgpGhhc2jEJ4QpJImPRZwMoQXBsQPTbolKfV3n/ULdu7UtEMxZZ+fFAWFO1p6fVKlzaWduYXR1cmXEQF9kWMKc3wf8xt65amaTRf2nozajjzPjDOPKSJsdqQ/Y0npHOXAkJiU9Fp26wfFOKEil3mxagMD5zy4HlwGRnAOlZW50cnneAAGnUHJlc2VudN4AAqplbnRyeV90eXBlo0FwcKVlbnRyecQngqRyb2xlpUFETUlOrnJlY29yZF9sb2NhdG9yqzJAaG9sby5ob3N0",
  "base64"
);
export const MEM_PROOF4 = Buffer.from(
  "3gACrXNpZ25lZF9oZWFkZXLeAAKmaGVhZGVy3gACp2NvbnRlbnTeAAekdHlwZaZDcmVhdGWmYXV0aG9yxCeEICREcSxdIB5vMom0+wtjVdw148AUiJ4UG3PYBNqeWiTGdILUqTOpdGltZXN0YW1wks5gweIkzizMHdqqaGVhZGVyX3Nlcc0BM6twcmV2X2hlYWRlcsQnhCkkiY9FnAyhBcGxA9NuiUp9Xef9Qt27tS0QzFln58UBYU7Wnp9UqmVudHJ5X3R5cGXeAAGjQXBw3gADomlkAKd6b21lX2lkAKp2aXNpYmlsaXR53gABplB1YmxpY8CqZW50cnlfaGFzaMQnhCEkja31eq31Dnmkl/k5CyIPvyfsgep0i740PUwgzzgnT7RMTayFpGhhc2jEJ4QpJGe8fjLxIOxSIZl2crceNfi7l0wY/luT5O2MhH9RW8NGuUoCLKlzaWduYXR1cmXEQMqa+wxfluud1OVebUZDfsYhDqPxL9cq0uyd7XOZPQ0SPn0FkwcXgo8SMQ/86Zk5LfMLsfzo8sqj4lPlzeXjfw6lZW50cnneAAGnUHJlc2VudN4AAqplbnRyeV90eXBlo0FwcKVlbnRyecQngqRyb2xlpUFETUlOrnJlY29yZF9sb2NhdG9yqzNAaG9sby5ob3N0",
  "base64"
);
export const MEM_PROOF5 = Buffer.from(
  "3gACrXNpZ25lZF9oZWFkZXLeAAKmaGVhZGVy3gACp2NvbnRlbnTeAAekdHlwZaZDcmVhdGWmYXV0aG9yxCeEICREcSxdIB5vMom0+wtjVdw148AUiJ4UG3PYBNqeWiTGdILUqTOpdGltZXN0YW1wks5gweIkzi072IOqaGVhZGVyX3Nlcc0BNatwcmV2X2hlYWRlcsQnhCkkxxxL/naI+XnDuQT7HScY+PVhFkoTl60ZOwoTJ6Q6nLZAsDx9qmVudHJ5X3R5cGXeAAGjQXBw3gADomlkAKd6b21lX2lkAKp2aXNpYmlsaXR53gABplB1YmxpY8CqZW50cnlfaGFzaMQnhCEkS0NVg0HhJluNPSDoV8C/QYP20kL8Q+Ve+hzhMZveMdizLvlkpGhhc2jEJ4QpJD5lmLUBTZ0uc5x0DAvN/x4VUrQhZP3oxT62yKbA82FsS3fbIalzaWduYXR1cmXEQDtr34yHov8+RXjBpRgOdr9zZ5fkJs0f8CsrmakBUFS0w47nl2sIXdWrtgKTLoBuh/36RaTt/K2H0pvglWJKjA+lZW50cnneAAGnUHJlc2VudN4AAqplbnRyeV90eXBlo0FwcKVlbnRyecQngqRyb2xlpUFETUlOrnJlY29yZF9sb2NhdG9yqzVAaG9sby5ob3N0",
  "base64"
);

export const MEM_PROOF_READ_ONLY = Buffer.from([0]);

const lobbyDna = path.join(__dirname, "../../workdir/dna/lobby.dna");

export const installAgents = async (
  conductor: Player,
  agentNames: string[],
  memProofArray?,
  holo_agent_override?
) => {
  const admin = conductor.adminWs();
  const dnaHash = await conductor.registerDna(
    { path: lobbyDna },
    conductor.scenarioUID,
    { skip_proof: !memProofArray ? true : false, holo_agent_override }
  );
  const agentsHapps: Array<InstalledHapp> = [];
  for (let i = 0; i < agentNames.length; i++) {
    const agent = agentNames[i];
    console.log(`generating key for: ${agent}:`);
    const agent_key = await admin.generateAgentPubKey();
    console.log(`${agent} pubkey:`, agent_key.toString("base64"));

    let dna = {
      hash: dnaHash,
      role_id: "lobby",
      nick: "kizuna",
    };
    if (memProofArray) {
      dna["membrane_proof"] = Array.from(memProofArray[i]);
    }

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
