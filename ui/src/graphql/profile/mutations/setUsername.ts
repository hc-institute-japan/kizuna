import { gql } from "@apollo/client";

export default gql`
  mutation SetUsername($username: String) {
    setUsername(username: $username) {
      id
      username
    }
  }
`;
