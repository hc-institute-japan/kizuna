import {gql} from '@apollo/client';

export default gql`
  query pubkey($username: String) {
    getPubkeyFromUsername(username: $username) {
      hash
      hash_type
    }
  }
`;
