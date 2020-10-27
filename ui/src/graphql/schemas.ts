import {gql} from '@apollo/client';
import profileSchema from './profile/schema';
const init = gql`
  type Query {
    initQuery: Boolean
  }

  type Mutation {
    initMutation: Boolean
  }
`;

export default [init, profileSchema];
