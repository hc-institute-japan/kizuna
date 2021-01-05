import {gql} from '@apollo/client';

export default gql`
  mutation CreateProfile($username: String) {
    createProfile(username: $username) {
      id {
        hash
        hash_type
      }
      username
    }
  }
`;
