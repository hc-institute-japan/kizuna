import {AppApi, AppWebsocket} from '@holochain/conductor-api';

let client: AppApi;

const init = async () => {
  if (client) {
    return client;
  }
  try {
    client = await AppWebsocket.connect('ws://localhost:8888');
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const callZome = async (config: any) => {
  await init();
  const info = await client.appInfo({app_id: 'test-app'});
  const response = await client.callZome({
    ...config,
    cell_id: info.cell_data[0][0],
    provenance: info.cell_data[0][0][1],
  });
  return response;
};
