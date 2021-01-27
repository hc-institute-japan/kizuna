import { gql } from "@apollo/client";
import ProfileSchema from "./profile/schema";

const init = gql`
  type Query {
    initQ: Boolean
  }

  type Mutation {
    initM: Boolean
  }
`;

const typeDefs = [init, ProfileSchema];

export default typeDefs;
