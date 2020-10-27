import {ResolverType} from '../../utils/types';

const resolver: ResolverType = {
  Query: {
    all: async (_obj, _args, {callZome}) => {
      const all = callZome({
        zomeName: 'username',
        fnName: 'get_all_usernames',
      });

      return all.map((user: any) => ({
        id: user.username,
        username: user.agent_id,
      }));
    },
    getMyAgentId: async (_obj, _args, {getAgentId}) => await getAgentId(),

    me: async (_obj, _args, {callZome, getAgentId}) => {
      const id = await getAgentId();
      const me = await callZome({
        zomeName: 'username',
        fnName: 'get_username',
        payload: id,
      });
      console.log(me);
      return me
        ? {
            username: me.username,
            id,
          }
        : null;
    },
    getPubkeyFromUsername: async (_obj, {username}, {callZome}) => {
      console.log(username);
      const pubkey = await callZome({
        zomeName: 'username',
        fnName: 'get_agent_pubkey_from_username',
        payload: username,
      });
      // console.log(pubkey);
      // console.log(Uint8Array.from(pubkey.hash));

      return !pubkey
        ? null
        : {
            hash: Uint8Array.from(pubkey.hash),
            hash_type: Uint8Array.from(pubkey.hash_type),
          };
    },
    // username: async (_obj, {address: id}, {callZome}) => {
    //   const profile = async
    // }
  },
  Mutation: {
    createProfile: async (_obj, {username}, {callZome}) => {
      let profile = await callZome({
        zomeName: 'username',
        fnName: 'set_username',
        payload: username,
      });

      return profile
        ? {
            username: profile.username,
            id: profile.agent_id,
          }
        : null;
    },
    //   deleteProfile: async (_obj, username, {callZome}) => callZome({
    //       zomeName: 'username',
    //       fnName:
    //   })
  },
};

export default resolver;
