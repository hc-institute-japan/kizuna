import { Resolvers } from "@apollo/client";
import { convertIdtoUInt8Array } from "../../utils/helpers";

const resolvers: Resolvers = {
  Query: {
    contacts: async (_obj, _args, { callZome }) => {
      const ids = await callZome({
        zomeName: "contacts",
        fnName: "list_added",
      });

      const contacts = await Promise.all(
        ids.map(async (id: Uint8Array) => ({
          id,
          username: await callZome({
            zomeName: "zomeone",
            fnName: "get_username",
            payload: id,
          }).username,
        }))
      );

      return contacts;
    },
    all: async (_obj, _args, { callZome }) => {
      const all = await callZome({
        zomeName: "username",
        fnName: "get_all_usernames",
      });

      return all.map(({ agent_id, username }: any) => ({
        id: agent_id,
        username,
      }));
    },
  },
  Mutation: {
    addContacts: async (_o, { contacts }, { callZome }) => {
      console.log(convertIdtoUInt8Array(contacts[0].id));
      const ids = await callZome({
        zomeName: "contacts",
        fnName: "add_contacts",
        payload: [convertIdtoUInt8Array(contacts[0].id)],
      });

      const addedContacts = await Promise.all(
        ids.map(async (id: Uint8Array) => {
          const { username } = await callZome({
            zomeName: "username",
            fnName: "get_username",
            payload: id,
          });
          console.log(username);
          return {
            id,
            username,
          };
        })
      );

      console.log(addedContacts);
      return addedContacts;
    },
  },
};

export default resolvers;
