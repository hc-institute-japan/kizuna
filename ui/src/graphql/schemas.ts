import { gql } from "@apollo/client";
import ProfileSchema from "./profile/schema";
import ContactsSchema from "./contacts/schema";

const init = gql`
  type Query {
    initQ: Boolean
  }

  type Mutation {
    initM: Boolean
  }
`;

const typeDefs = [init, ProfileSchema, ContactsSchema];

export default typeDefs;
