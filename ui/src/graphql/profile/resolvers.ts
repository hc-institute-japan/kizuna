import { Resolvers } from "@apollo/client";
import { Profile } from "../../redux/profile/types";

const resolvers: Resolvers = {
  Query: {
    me: async (_obj, _args, { callZome, getAgentId }) => {
      const id = await getAgentId();

      const res = await callZome({
        zomeName: "username",
        fnName: "get_my_username",
      });

      const profile: Profile = {
        id,
        username: res.username,
      };

      return profile;
    },
  },
  Mutation: {
    setUsername: async (_obj, { username }, { callZome, getAgentId }) => {
      const id = await getAgentId();

      const res = await callZome({
        zomeName: "username",
        fnName: "set_username",
        payload: username,
      });

      const profile: Profile = {
        id,
        username: res.username,
      };

      return profile;
    },
    // getUsername: async (_obj, { id }, { callZome }) => {
    //   const res = await callZome({
    //     zomeName: "username",
    //     fnName: "get_username",
    //     payload: convertIdtoUInt8Array(id),
    //   });

    //   const profile: Profile = {
    //     id,
    //     username: res.username,
    //   };

    //   return profile;
    // },
  },
};

export default resolvers;
