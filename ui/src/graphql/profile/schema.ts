import { gql } from "@apollo/client";

export default gql`
  type Profile {
    id: [Int!]
    username: String!
  }

  input SetUsernameInput {
    username: String!
  }

  extend type Query {
    me: Profile
  }

  extend type Mutation {
    setUsername(username: SetUsernameInput!): Profile!
  }
`;
