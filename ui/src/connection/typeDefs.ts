import gql from 'graphql-tag';

const init = gql`
  type Query {
    fillerQuery: Boolean
  }
  type Mutation {
    fillerMutation: Boolean
  }
`;

export default [init];
