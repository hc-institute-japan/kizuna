import gql from 'graphql-tag';

const schema = gql`
  type PubKey {
    hash: [Int!]!
    hash_type: [Int!]!
  }

  type Profile {
    id: PubKey!
    username: String
  }

  input ProfileInput {
    username: String!
  }

  extend type Query {
    all: [Profile!]!
    me: Profile
    getPubkeyFromUsername(username: String): PubKey
    getMyAgentId: PubKey!
  }

  extend type Mutation {
    createProfile(username: String): Profile
    deleteProfile(username: String): Boolean
  }
`;

export default schema;
