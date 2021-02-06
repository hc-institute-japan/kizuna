import { gql } from "@apollo/client";

export default gql`
  query All {
    all {
      id
      username
    }
  }
`;
