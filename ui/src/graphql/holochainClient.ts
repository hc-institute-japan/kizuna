import {AppWebsocket, AdminWebsocket} from '@holochain/conductor-api';
const ADMIN_PORT = 1234;

export async function installApp(port, dnas, appId) {
  const adminWebsocket = await AdminWebsocket.connect(
    `ws://localhost:${ADMIN_PORT}`,
  );

  const pubKey = await adminWebsocket.generateAgentPubKey();

  const app = await adminWebsocket.installApp({
    agent_key: pubKey,
    app_id: appId,
    dnas: dnas.map((dna) => {
      const path = dna.split('/');
      return {nick: path[path.length - 1], path: dna};
    }),
  });

  await adminWebsocket.activateApp({app_id: appId});
  await adminWebsocket.attachAppInterface({port});

  const appWebsocket = await AppWebsocket.connect(`ws://localhost:${port}`);

  console.log(`Successfully installed app on port ${port}`);

  await appWebsocket.client.close();
  await adminWebsocket.client.close();
}
