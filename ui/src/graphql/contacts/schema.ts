import { gql } from "@apollo/client";

const schema = gql`
  input AddContact {
    id: [Int!]
    username: String!
  }

  extend type Query {
    contacts: [Profile!]
    all: [Profile!]
  }

  extend type Mutation {
    addContacts(contacts: [AddContact!]): [Profile!]
  }
`;

export default schema;
