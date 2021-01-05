import {gql} from '@apollo/client';

export default gql`
  query GetMyAgentId {
    getMyAgentId {
      hash
      hash_type
    }
  }
`;
